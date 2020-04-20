
function SQLEngine(database) {

    const op = {
        '<': (x, y) => x < y,
        '>': (x, y) => x > y,
        '=': (x, y) => x == y,
        '<>': (x, y) => x != y
    };
    const re_query_tbl_or_col = /(\s|\,)*([a-zA-Z]+(\.)?[a-zA-Z]+)(\s|\,)*/;
    const re_string = /(\'|")?([^"]*)(\'|")?/;
    const re_digit = /-?[0-9]+/;
    const re_split = /(("[^"]*")|[^ ]+)/g;
    const query_keywords = ['select', 'from', 'where']

    function query_elem_regex(elem) {
        let match_array = re_query_tbl_or_col.exec(elem);
        return match_array[2];
    }

    function parse_where_clause(query_split) {

        let where_index = query_split.indexOf("where");
        if (where_index < 0)
            return [-1, null];

        let l_expr = query_split[where_index + 1];
        let [l_expr_table, l_expr_col] = l_expr.split(".");

        let operator = query_split[where_index + 2];
        let elem = query_split[where_index + 3];

        let string_result = re_string.exec(elem)
        let r_expr;
        if (string_result) {
            r_expr = string_result[2]
        } else {
            r_expr = parseInt(re_digit.exec(elem)[0])
        }
        let where_clause = {
            'l_expr_table': l_expr_table,
            'l_expr_col': l_expr_col,
            'operator': operator,
            'r_expr': r_expr
        }
        return [where_index, where_clause];
    }

    this.execute = function (query) {
        let splitted = query.match(re_split);

        let query_split = splitted.filter(elem => elem != ",")
            .map(elem =>
                query_keywords.includes(elem.toLowerCase()) ? elem.toLowerCase() : elem);

        let from_index = query_split.indexOf("from");

        let [where_index, where_clause] = parse_where_clause(query_split);
        let last_table_index = where_clause !== null ? where_index : query_split.length;

        // list of tables in lower case
        let tables = query_split.slice(from_index + 1, last_table_index)
            .map(query_elem_regex)
            .map(elem => elem.toLowerCase());

        // list of columns in lower case
        let columns = query_split.slice(1, from_index).map(
            col => query_elem_regex(col)).map(
                elem => elem.toLowerCase()
            );

        // Group the columns for each table in a dictionary
        // assuming the columns in the select statement are listed as table.column
        let table_columns_dict = {};
        tables.forEach(table => {
            table_columns_dict[table] = columns.filter(function (column) {
                return column.split(".")[0] == table
            }).map(x => x.split(".")[1])
        });

        let final_result = []
        // For each selecetd table, get the selected columns on each row filtered by the where clause(if available)
        tables.forEach(table => {
            let result = database[table];
            if (where_clause !== null) {
                if (table == where_clause['l_expr_table']) {
                    result = result.filter(
                        x => op[where_clause['operator']](x[where_clause['l_expr_col']], where_clause['r_expr']))
                }
            }
            result = result.map(x => {
                let selected_key_dict = {};
                Object.keys(x).forEach(function (key) {
                    if (table_columns_dict[table].includes(key))
                        selected_key_dict[table + "." + key] = x[key];
                })
                return selected_key_dict;
            })
            final_result = final_result.concat(result);
        });
        return final_result;
    }
}

exports.SQLEngine = SQLEngine;

