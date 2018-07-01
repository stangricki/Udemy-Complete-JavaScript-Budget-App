
// BUDGET CONTROLER
var budgetController = (function(){

	function Expense(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function(totalIncome) {

		if(totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};

	function Income(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	}

	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function(elem) {
			sum += elem.value;
		});
		data.totals[type] = sum;
	}

	var data = {
		allItems:{
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0	
		},
		budget: 0,
		percentage: -1
	}

	return {
		addItem: function(type, des, val){
			var newItem, ID;

			if(data.allItems[type].length > 0){
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}

			if(type === "exp") {
				newItem = new Expense(ID, des, val);
			} else if (type === "inc") {
				newItem = new Income(ID, des, val);
			}

			data.allItems[type].push(newItem);
			return newItem;
		},

		deleteItem: function(type, id) {
			data.allItems[type].map((elem, i) => {
				if(elem.id === Number(id)) {
					data.allItems[type].splice(i, 1);
				}
			});
		},

		calculateBudget: function() {
			calculateTotal('exp');
			calculateTotal('inc');

			data.budget = data.totals.inc - data.totals.exp;
			if(data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1;
			}

		},

		calculatePercentages: function(){
			// forEach expense expense/total * 100
			data.allItems.exp.forEach(elem => {
				elem.calcPercentage(data.totals.inc);
			});
		},
 
		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage,
			}
		},

		getPercentages: function() {
			var allPerc = data.allItems.exp.map(elem => {
				return elem.getPercentage()
			});
			return allPerc;
		},

		testing: function(){
			console.log(data);
		}
	}

})();

// UI CONTROLER
var UIController = (function(){

	var DOMStrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercentageLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};

	var formatNumber = function(num, type) {
			var numSplit, int, dec;
			num = Math.abs(num);
			num = num.toFixed(2);

			numSplit = num.split('.');
			int = numSplit[0];
			dec = numSplit[1];
			if(int.length > 3) {
				int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
			}
			return `${(type === 'exp') ? '-' : '+'} ${int}.${dec}`;
			
		};

	return {
		getInput: function(){
			return {
				type: document.querySelector(DOMStrings.inputType).value,
				value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
				description: document.querySelector(DOMStrings.inputDescription).value
			};
		},
		addListItem: function(obj, type) {
			var html, newHtml, element;
			if(type === 'inc') {
				element = DOMStrings.incomeContainer;
				html = `
					<div class="item clearfix" id="${type}-${obj.id}">
					    <div class="item__description">${obj.description}</div>
					    <div class="right clearfix">
					        <div class="item__value">${formatNumber(obj.value, 'inc')}</div>
					        <div class="item__delete">
					            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
					        </div>
					    </div>
					</div>`;
			} else if (type === 'exp') {
				element = DOMStrings.expensesContainer;
				html = `
					<div class="item clearfix" id="${type}-${obj.id}">
			        <div class="item__description">${obj.description}</div>
			        <div class="right clearfix">
			            <div class="item__value">${formatNumber(obj.value, 'exp')}</div>
			            <div class="item__percentage">21%</div>
			            <div class="item__delete">
			                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
			            </div>
			        </div>
			    </div>`;
			}
			document.querySelector(element).insertAdjacentHTML('beforeend', html);
		},
		deleteListItem: function(selectorID){
			var el = document.getElementById(selectorID)
			el.parentNode.removeChild(el);

		},
		
		clearFields: function(){
			var fields, fieldsArray;
			fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
			fieldsArray = Array.prototype.slice.call(fields);
			fieldsArray.forEach(elem => elem.value = '') ;
			fieldsArray[0].focus();
		},

		displayBudget: function(obj) {
			var type;
			(obj.budget > 0) ? type = 'inc' : type = 'exp';

			document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, type);

			if(obj.percentage > 0) {
				document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMStrings.percentageLabel).textContent = '---';
			}

		},

		displayPercentages: function(percentages){
			var fields = Array.from(document.querySelectorAll(DOMStrings.expensesPercentageLabel));
			console.log(fields)
			fields.forEach((elem, i) => {
				if (percentages[i] > 0) {
					elem.innerText = percentages[i] + '%';
				} else {
					elem.innerText = '---';
				}
			})
		},

		displayMonth: function() {
			var now, month, year, months;

			now = new Date();
			month = now.getMonth();
			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
			year = now.getFullYear();

			document.querySelector(DOMStrings.dateLabel).innerText  = `${months[month]} ${year}`
		},

		changedType: function(e) {
			
			var fields = Array.from(document.querySelectorAll(
				DOMStrings.inputType + ',' +  
				DOMStrings.inputDescription + ',' +
				DOMStrings.inputValue));
			fields.forEach(elem => {
				elem.classList.toggle('red-focus')
			})

			document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
			
		},

		getDOMStrings: function() {
			return DOMStrings;
		},

	}
})()

// GLOBAL APP CONTROLER
var controller = (function(budgetCtrl, UICtrl){

		var setupEventListeners = function(){
			var DOM = UIController.getDOMStrings();
			
			document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

			document.addEventListener('keypress', function(e){
				if (e.keyCode === 13 || e.which === 13) {
					ctrlAddItem();
				}
			});

			document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

			document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
		};

		var updatePercentages = function() {
			budgetCtrl.calculatePercentages();
			var percentages = budgetCtrl.getPercentages();
			UICtrl.displayPercentages(percentages);
			// console.log(percentages)
		}

		var updateBudget = function() {
				budgetCtrl.calculateBudget();
				var budget = budgetCtrl.getBudget();
				UICtrl.displayBudget(budget);
		};

		var ctrlAddItem = function(){
			var input, newItem;

			input = UIController.getInput(); // Get input from fields

			
			if(input.description !== '' && !isNaN(input.value) && input.value > 0) { // Validation
				newItem = budgetCtrl.addItem(input.type, input.description, input.value);
				UICtrl.addListItem(newItem, input.type);
				UICtrl.clearFields();
				updateBudget();
				updatePercentages();

			}
		};

		var ctrlDeleteItem = function(e) {
			var itemID, splitID, type, ID;

			itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
			
			if(itemID) {
				splitID = itemID.split('-');
				type = splitID[0];
				ID = splitID[1];
			};

			budgetCtrl.deleteItem(type, ID);
			UICtrl.deleteListItem(itemID);
			updateBudget();
			updatePercentages();
		}

		return {
			init: function(){
				console.log('Application has started.');
				UICtrl.displayMonth();
				UICtrl.displayBudget({
					budget: 0,
					totalInc: 0,
					totalExp: 0,
					percentage: -1
				});
				setupEventListeners();
			}
		}


})(budgetController, UIController)

controller.init()

