; (function (container, document) {
    const nnInputs = [{ technology: "PHP", inputName: "php", isSelected: false }, { technology: "Laravel", inputName: "laravel", isSelected: false }, { technology: "Symfony", inputName: "symfony", isSelected: false }, { technology: "NodeJs", inputName: "nodejs", isSelected: false }, { technology: "ExpressJs", inputName: "expressjs", isSelected: false }, { technology: "Python", inputName: "python", isSelected: false }, { technology: "Django", inputName: "django", isSelected: false }, { technology: "Java", inputName: "java", isSelected: false }, { technology: "Android", inputName: "android", isSelected: false }, { technology: "CSharp", inputName: "csharp", isSelected: false }, { technology: "Asp.Net", inputName: "aspnet", isSelected: false }, { technology: "MySql", inputName: "mysql", isSelected: false }, { technology: "Postgres", inputName: "postgres", isSelected: false }, { technology: "Javascript", inputName: "javascript", isSelected: false }, { technology: "Angular", inputName: "angular", isSelected: false }, { technology: "React", inputName: "react", isSelected: false }, { technology: "Ember", inputName: "ember", isSelected: false }, { technology: "JQuery", inputName: "jquery", isSelected: false }];

    requirejs.config({
        baseUrl: 'scripts/lib'
    });

    require(['synaptic'], () => {
        const NN_PATH = 'scripts/lib/nn_model.json';
        const SALARY_NORM_RATE = 1000000;
        let Network = synaptic.Network;;

        let nn = null;

        /**
         * Create new node with checkbox for choosing technology.
         * 
         * @param {Node} template 
         * @param {string} title 
         * @param {string} inputName 
         * @returns {Node}
         */
        function createCheckbox(template, title, inputName) {
            let newNode = template.cloneNode(true);

            /** @type {Node} */
            let titleNode = newNode.getElementsByClassName('technology__name')[0];
            titleNode.textContent = title;

            /** @type {Node} */
            let input = newNode.getElementsByTagName('input')[0];
            input.setAttribute('name', inputName);
            input.addEventListener('click', event => {
                const selectedInput = nnInputs.find(nnInput => nnInput.inputName == event.target.getAttribute('name'));
                selectedInput.isSelected = !selectedInput.isSelected;
                predict();
            });

            return newNode;
        }

        /**
         * Render all checkboxes.
         * 
         */
        function createCheckboxesForInputs() {
            let names = nnInputs.map(nnInput => {
                return {
                    title: nnInput.technology,
                    input: nnInput.inputName
                }
            })

            let templateNode = document.querySelector('div.technology');
            let nodes = names.map(name => {
                return createCheckbox(templateNode, name.title, name.input)
            })

            let checkBoxContainer = templateNode.parentNode;
            checkBoxContainer.removeChild(templateNode);

            nodes.forEach(node => checkBoxContainer.appendChild(node));
        }

        /**
         * Load neural network and start wage-prediction application.
         * 
         */
        function startApp() {
            createCheckboxesForInputs();
            loadNN()
                .then(initModel)
                .then(() => "Neural Network has been loaded!")
                .then((msg) => {
                    logProgress("NN", msg);
                })
                .then(predict());
        }

        
        /**
         * Send message to logs.
         * 
         * @param {any} title 
         * @param {any} message 
         */
        function logProgress(title, message) {
            console.log(`${title}: ${message}`);
        }


        /**
         * Asynchronous load of neural network.
         * 
         * @returns {Promise<string>}
         */
        function loadNN() {
            return new Promise((resolve, reject) => {
                let req = new XMLHttpRequest();
                req.open('GET', NN_PATH, false);
                req.send(null);
                let jsonModel = null;
                if (req.status === 200) {
                    logProgress("NN", "Loaded");
                    jsonModel = JSON.parse(req.responseText);
                    resolve(jsonModel);
                } else {
                    logProgress("NN", "Loading failed");
                    reject(req.responseText);
                }
            })
        }

        /**
         * Initialize neural network from model.
         * 
         * @param {string} jsonModel 
         */
        function initModel(jsonModel) {
            nn = Network.fromJSON(jsonModel);
        }


        /**
         * Get input vector for neural networ.
         * 
         * @returns number[]
         */
        function skillsToVec() {
            return nnInputs.map(nnInput => +nnInput.isSelected);
        }

        
        /**
         * Render salary.
         * 
         * @param {number} normalizedSalary 
         */
        function setSalary(normalizedSalaryFrom, normalizedSalaryTo) {
            let salaryFrom = Math.round(normalizedSalaryFrom * SALARY_NORM_RATE);
            let salaryTo = Math.round(normalizedSalaryTo * SALARY_NORM_RATE);
            let salaryLabel = document.getElementById('predicted-salary');
            salaryLabel.textContent = `От ${salaryFrom} до ${salaryTo}`;
            logProgress("NN", "Salary update");
        }

        /**
         * Predict salary for chosen inputs.
         * 
         */
        function predict() {
            Promise.resolve(skillsToVec())
                .then((inputVec) => nn.activate(inputVec))
                .then((outputVec) => setSalary(outputVec[0], outputVec[1]))
        }

        window.predictSalary = predict;

        startApp();
    });
})(window, document);




