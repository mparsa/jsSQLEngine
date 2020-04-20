const SQLEngine = require('./sqlengine');
var assert = require('assert');

var dummyDatabase = {
    employees: [{
        id: 1,
        name: 'Alice',
        phone: '(936) 476-1404',
    },
    {
        id: 2,
        name: 'Bob',
        phone: '87654321',
    }
    ]
};

describe('execution', function () {
    var engine = new SQLEngine.SQLEngine(dummyDatabase);

    it('should SELECT columns', function () {
        var actual = engine.execute('SELECT employees.name FROM employees');
        assert.deepEqual(actual,
            [{ "employees.name": "Alice" },
            { "employees.name": "Bob" }]);
    });

    it('should apply WHERE', function () {
        var actual = engine.execute('SELECT employees.id, employees.name FROM employees WHERE employees.id = 1');
        assert.deepEqual(actual, [{
            "employees.id": 1,
            "employees.name": "Alice"
        }]);
    });

    it('should apply WHERE with integer comparison', function () {
        var actual = engine.execute('SELECT employees.name FROM employees WHERE employees.id > -1');
        assert.deepEqual(actual,
            [{ "employees.name": "Alice" },
            { "employees.name": "Bob" }]);
    });

    it('should apply WHERE with string comparison', function () {
        var actual = engine.execute('SELECT employees.name FROM employees WHERE employees.name > "Ax"');
        assert.deepEqual(actual, [{ "employees.name": "Bob" }]);
    });

    it('should be case-insensitive', function () {
        var actual = engine.execute('select Employees.id, employees.Name from employEEs where employees.id = 1');
        assert.deepEqual(actual, [{
            "employees.id": 1,
            "employees.name": "Alice"
        }]);
    });

    it('should be case-insensitive', function () {
        var actual = engine.execute('select employees.id, employees.name from employees where employees.phone = "(936) 476-1404"');
        assert.deepEqual(actual, [{
            "employees.id": 1,
            "employees.name": "Alice"
        }]);
    });



});