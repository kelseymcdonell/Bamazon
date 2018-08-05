var mysql = require("mysql");

var inquirer = require('inquirer')

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    database: 'bamazon_db',
});

connection.connect(function (err) {
  console.log("Connected as id " + connection.threadId);
  start()
});

function start(){
    inquirer.prompt({
        name: "question",
        type: "list",
        message: "How can I help you?",
        choices: ["Search Inventory", "Buy"]
    }).then(function(answer){
        if(answer.question == "Search Inventory"){
            search()

        } else if(answer.question == "Buy") {
            buy()
        }
    })
}

function search() {
    connection.query('SELECT * FROM products', function (err, res, fields) {
        var numResults = res.length

        connection.query('SELECT * FROM products', function (error, results, fields) {
            if (error) throw error;
            for (i = 0; i < numResults; i++) {
                console.log("ID: " + results[i].item_id + " Product: " + results[i].product_name + " Price: $" + results[i].price)

            }
            start();
        });
    })};

function buy() {
    var array = [];
    connection.query('SELECT item_id, product_name FROM products', function (error, results, fields) {
        if (error) throw error;
        for (i = 0; i < results.length; i++) {
            array.push(results[i].product_name)
        }
        inquirer.prompt([{
                type: "list",
                name: "action",
                message: "What would you like to buy?",
                choices: array
            },
            {
                type: "input",
                name: "quantityRequested",
                message: "How many would you like to buy?"
            }
        ]).then(function (user) {
            connection.query('SELECT stock_quantity, price FROM products WHERE product_name = ?', user.action, function (error, results, fields) {

                if ((results[0].stock_quantity > 0) && (results[0].stock_quantity - user.quantityRequested >= 0)) {
                    var stockQuantity = results[0].stock_quantity - user.quantityRequested
                    var price = parseFloat(user.quantityRequested * results[0].price)
                    
                    connection.query('UPDATE products SET ? WHERE ?', [{
                        stock_quantity: stockQuantity
                    }, {
                        product_name: user.action
                    }], function (error, results, fields) {
                        console.log("Price: " + price)
                    })
                }
                else {
                    console.log("Sorry, we're all out! Try again later.")
                    start();
                }
            })
        });
    })
};




