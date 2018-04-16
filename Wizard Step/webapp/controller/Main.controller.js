sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/WizardStep",
	"sap/m/MessageToast"
], function(Controller, WizardStep, MessageToast) {
	"use strict";

	return Controller.extend("baoaos4bqn1.controller.Main", {
		onInit: function() {
			this.steps = [];
			this.aQuestion = [];
			this.wizard = this.getView().byId("QuestionWizard");
			this.oDataModel = this.getOwnerComponent().getModel();
			this._getSteps();

		},
		//get steps
		_getSteps: function() {
			var sPath = "/StepSet";
			this.oDataModel.read(sPath, {
				success: jQuery.proxy(function(oData) {
					this.steps = oData.results;
					this._setSteps(oData.results);
				}, this),
				error: jQuery.proxy(function(oError) {
					$.sap.log.error(oError);
				}, this)
			});
			// var sPath = "/WizardStepSet";
			// this.oDataModel.read(sPath, {
			// 	success: jQuery.proxy(function(oData) {
			// 		this.steps = oData.results;
			// 		this._setWizardSteps(oData.results, false);
			// 	}, this),
			// 	error: jQuery.proxy(function(oError) {
			// 		$.sap.log.error(oError);
			// 	}, this)
			// });
		},
		//Set steps and get questions
		_setSteps: function(aSteps) {
			var oNewWizardStep;
			var oStep;
			var stepId;
			for (var i = 0; i < aSteps.length; i++) {
				oStep = aSteps[i];
				stepId = "step" + oStep.StepOrdno;
				oNewWizardStep = new WizardStep({
					title: oStep.StepName,
					id: stepId
				});
				// this.wizard.addStep(oNewWizardStep);
				this._getQuestions(oStep, stepId, oNewWizardStep);
			}

		},
		//get questions
		_getQuestions: function(oStep, stepId, oNewWizardStep) {
			var oWizardStep = sap.ui.getCore().byId(stepId);
			var sPath = "/StepSet(Scope='" + oStep.Scope + "',StepOrdno='" + oStep.StepOrdno + "')/Questions";
			this.oDataModel.read(sPath, {
				success: jQuery.proxy(function(oData) {
					this.aQuestion.push(oData.results);
					this.wizard.addStep(oNewWizardStep);
					this._setQuestion(oData.results, oWizardStep);
				}, this),
				error: jQuery.proxy(function(oError) {
					$.sap.log.error(oError);
				}, this)
			});
		},
		_setQuestion: function(aQues, oWizardStep) {
			var oMyForm;
			var oQues;
			var aQuesOrd = [];
			var max = 0;
			oMyForm = new sap.ui.layout.form.SimpleForm({
				layout: sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout,
				maxContainerCols: 1,
				labelSpanL: 12,
				labelSpanM: 12,
				emptySpanL: 0,
				emptySpanM: 0,
				columnsL: 1,
				columnsM: 1,
				content: []
			});
			//sort the question order number
			for (var i = 0; i < aQues.length; i++) {
				var aQuesOrdTmp = aQues[i].QuestionOrdno.split('.');
				aQuesOrd.push(aQuesOrdTmp);
				aQues[i].aQuesOrd = aQuesOrdTmp;
				aQuesOrdTmp = [];
			}
			//get max length of the question
			for (var j = 0; j < aQues.length; j++) {
				if (aQues[j].aQuesOrd.length > max) {
					max = aQues[j].aQuesOrd.length;
				}
			}
			// adjust question ord according max
			for (i = 0; i < aQues.length; i++) {
				if (aQues[i].aQuesOrd.length < max) {
					for (j = aQues[i].aQuesOrd.length; j < max; j++) {
						aQues[i].aQuesOrd[j] = "0";
					}
				}
			}

			// // sort 
			// for (i = max - 1; i > 0; i--) {
			// 	aQues.sort(function(a, b) {
			// 		return b.aQuesOrd[i] - a.aQuesOrd[i];
			// 	});
			// }
			// aQues.reverse();
			for (var m = 1; m < max; m++) {
				aQues = this._sortArry(aQues, m);
			}

			for (var i = 0; i < aQues.length; i++) {
				oQues = aQues[i];
				// insert form according to answer type
				if (oQues.AnswerType === "Free") { // input 
					var label = new sap.m.Label({
						displayOnly: true,
						wrapping: true,
						text: oQues.QuestionOrdno + " " + oQues.QuestionText
					});
					var id = "id" + oQues.StepOrdno + oQues.QuestionOrdno;
					var oInput = new sap.m.Input({
						// placeholder: "Simple Input",
						id: id
					});
					oMyForm.addContent(label);
					oMyForm.addContent(oInput);
				} else if (oQues.AnswerType === "Radio") { // radio button
					label = new sap.m.Label({
						displayOnly: true,
						wrapping: true,
						text: oQues.QuestionOrdno + " " + oQues.QuestionText
					});
					id = "id" + oQues.StepOrdno + oQues.QuestionOrdno;
					var oRadio = new sap.m.Switch({
						state: true,
						id: id,
						customTextOn: "Yes",
						customTextOff: "No"
					});
					oMyForm.addContent(label);
					oMyForm.addContent(oRadio);
				} else if (oQues.AnswerType === "List") { // radio button
					label = new sap.m.Label({
						displayOnly: true,
						wrapping: true,
						text: oQues.QuestionOrdno + " " + oQues.QuestionText
					});
					id = "id" + oQues.StepOrdno + oQues.QuestionOrdno;
					var oSelect = new sap.m.Select({
						id: id
					});
					this._setValueHelps(oQues, oSelect);
					oMyForm.addContent(label);
					oMyForm.addContent(oSelect);
				} else {
					var oTitle = new sap.ui.core.Title({
						text: oQues.QuestionOrdno + " " + oQues.QuestionText
					});
					oMyForm.addContent(oTitle);
				}

			}
			oWizardStep.addContent(oMyForm);
		},
		_sortArry: function(arry, index) {
			var tmp;
			var aArryTmp = [];
			var result = [];
			arry.sort(function(a, b) {
				return a.aQuesOrd[index - 1] - b.aQuesOrd[index - 1];
			});
			tmp = arry[0].aQuesOrd[index - 1];
			for (var i = 0; i < arry.length; i++) {
				if (arry[i].aQuesOrd[index - 1] > tmp) {
					aArryTmp.sort(function(a, b) {
						return a.aQuesOrd[index] - b.aQuesOrd[index];
					});
					result = result.concat(aArryTmp);
					aArryTmp = [];
					tmp = arry[i].aQuesOrd[index - 1];
				} else {
					aArryTmp.push(arry[i]);
				}
			}
			aArryTmp.sort(function(a, b) {
				return a.aQuesOrd[index] - b.aQuesOrd[index];
			});
			result = result.concat(aArryTmp);
			return result;
		},
		_setValueHelps: function(oQues, oSelect) {
			var sPath = "/QuestionSet(Scope='" + oQues.Scope + "',StepOrdno='" + oQues.StepOrdno + "',QuestionOrdno='" + oQues.QuestionOrdno +
				"')/ValueHelps";
			this.oDataModel.read(sPath, {
				success: jQuery.proxy(function(oData) {
					var oValues = oData.results;
					for (var i = 0; i < oValues.length; i++) {
						var oItem = new sap.ui.core.Item({
							key: oValues[i].AnswerValue,
							text: oValues[i].AnswerText
						});
						oSelect.addItem(oItem);
					}
				}, this),
				error: jQuery.proxy(function(oError) {
					$.sap.log.error(oError);
				}, this)
			});
		},
		// _setWizardSteps: function(oData, bValue) {
		// 	var iCurerntSepNo;
		// 	var oNewWizardStep;
		// 	var oMyForm;

		// 	for (var i = 0; i < oData.length; i++) {
		// 		var oQuestion = oData[i];

		// 		var qusNo = oQuestion.StepOrdno.replace(/\b(0+)/gi, "") + "." + oQuestion.QuestionOrdno.replace(/\b(0+)/gi, "");
		// 		var label = new sap.m.Label({
		// 			displayOnly: true,
		// 			wrapping: true,
		// 			text: qusNo + " " + oQuestion.QuestionText
		// 		});
		// 		var id = "id" + oQuestion.StepOrdno + oQuestion.QuestionOrdno;
		// 		// with value or not
		// 		if (bValue === false) {
		// 			var oInput = new sap.m.Input({
		// 				// placeholder: "Simple Input",
		// 				id: id
		// 			});

		// 		} else {
		// 			oInput = new sap.m.Input({
		// 				value: oQuestion.Answer,
		// 				id: id
		// 			});
		// 		}

		// 		if (iCurerntSepNo !== oQuestion.StepOrdno) {
		// 			iCurerntSepNo = oQuestion.StepOrdno;
		// 			if (i !== 0) {

		// 				this.wizard.addStep(oNewWizardStep);

		// 			}
		// 			oNewWizardStep = new WizardStep({
		// 				title: oQuestion.StepName
		// 			});
		// 			oMyForm = new sap.ui.layout.form.SimpleForm({
		// 				layout: sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout,
		// 				maxContainerCols: 1,
		// 				labelSpanL: 12,
		// 				labelSpanM: 12,
		// 				emptySpanL: 0,
		// 				emptySpanM: 0,
		// 				columnsL: 12,
		// 				columnsM: 12,
		// 				content: []
		// 			});

		// 		}

		// 		oMyForm.addContent(label);
		// 		oMyForm.addContent(oInput);
		// 		// oNewWizardStep.setTitle(oQuestion.StepName);
		// 		oNewWizardStep.addContent(oMyForm);
		// 	}
		// 	if (iCurerntSepNo > 0) {
		// 		oNewWizardStep.setValidated(false);
		// 		this.wizard.addStep(oNewWizardStep);
		// 	}

		// },
		//Press save button
		onSave: function() {
			var aQuestion = [];
			var oOppy = {
				"OppyName": this.getView().byId("nameText").getValue(),
				"Scope": "S4B001",
				"Answers": aQuestion
			};
			if (this.getView().byId("nameText").getValue() === "") {
				MessageToast.show("Please input Oppy Name");
			} else {
				var oQuestion = {
					"OppyName": this.getView().byId("nameText").getValue(),
					"StepOrdno": "",
					"QuestionOrdno": "",
					"Scope": "S4B001",
					"Answer": ""
				};
				for (var i = 0; i < this.aQuestion.length; i++) {
					var aQues = this.aQuestion[i];
					for (var j = 0; j < aQues.length; j++) {
						var oQues = aQues[j];
						var id = "id" + oQues.StepOrdno + oQues.QuestionOrdno;
						if (oQues.AnswerType === "List") {
							var ansTxt = sap.ui.getCore().byId(id).getSelectedKey();
						} else if (oQues.AnswerType === "Radio") {

							var state = sap.ui.getCore().byId(id).getState();
							if (state === true) {
								ansTxt = "YES";
							} else {
								ansTxt = "NO";
							}
						} else if (oQues.AnswerType === "Free") {
							ansTxt = sap.ui.getCore().byId(id).getValue();
						}
						if (ansTxt !== "" && oQues.AnswerType !== "") {
							oQuestion.Answer = ansTxt;
							oQuestion.StepOrdno = oQues.StepOrdno;
							oQuestion.QuestionOrdno = oQues.QuestionOrdno;
							oQuestion.Scope = oQues.Scope;
							oQuestion.OppyName = this.getView().byId("nameText").getValue();
							aQuestion.push(oQuestion);
							// this._saveAnswer(oQuestion);
							oQuestion = {};
						}

					}

				}
				oOppy.Answers = aQuestion;
				this._saveAnswer(oOppy);
			}

		},
		_saveAnswer: function(oOppy) {
			var that = this;

			this.oDataModel.create("/OppySet", oOppy, {
				success: function(oData, response) {
					$.sap.log.info(oData);
					var msgText = "Data has been created in the backend system";
					MessageToast.show(msgText);
				},
				error: function(oError) {
					that.oDataModel.setUseBatch(true);
					if (JSON.parse(oError.responseText).error.message.value) {
						MessageToast.show(JSON.parse(oError.responseText).error.message.value);
					} else {
						MessageToast.show("Transaction cannot be created in the backend system");
					}

				}
			});
		},
		// show the input customer answer
		onChangeOppyName: function() {
			var filters = [];
			var sFilter;
			var oppyName = this.getView().byId("nameText").getValue();
			sFilter = new sap.ui.model.Filter("OppyName", sap.ui.model.FilterOperator.EQ, oppyName);
			filters.push(sFilter);
			var sPath = "/AnswersSet";
			this.oDataModel.read(sPath, {
				filters: filters,
				success: jQuery.proxy(function(oData) {
					if (oData.results.length > 0) {
						var aAns = oData.results;
						for (var i = 0; i < aAns.length; i++) {
							var idInput = "id" + aAns[i].StepOrdno + aAns[i].QuestionOrdno;
							var ansTxtControl = sap.ui.getCore().byId(idInput);
							if (aAns[i].QuestionType === "Radio") {
								if (aAns[i].Answer === "YES") {
									ansTxtControl.setState(true);
								} else {
									ansTxtControl.setState(false);
								}
							} else if (aAns[i].QuestionType === "List") {
								ansTxtControl.setSelectedKey(aAns[i].Answer);
							} else if (aAns[i].QuestionType === "Free") {
								ansTxtControl.setValue(aAns[i].Answer);
							}
						}
					} else {
						MessageToast.show("No questionaire information matained for this customer.");
					}

				}, this),
				error: jQuery.proxy(function(oError) {
					$.sap.log.error(oError);
				}, this)
			});
		}
	});
});