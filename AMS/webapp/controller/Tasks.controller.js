sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	"sap/ui/export/Spreadsheet",
	'sap/m/MessageToast'
], function(jQuery, Controller, JSONModel, Spreadsheet, MessageToast) {
	"use strict";

	var PageController = Controller.extend("AMSTools.controller.Tasks", {

		onInit: function(evt) {
			this.getOwnerComponent().getRouter().getRoute("task").attachPatternMatched(this._onObjectMatched, this);
			this.oView = this.getView();
			this.oTaskModel = this.getOwnerComponent().getModel();
			this.setBackgroundPicture();
			this.setTaskContent();
		},
		_onObjectMatched: function() {
			this.setTaskContent();
		},
		setBackgroundPicture: function() {
			var app = this.getView().byId("task_id");
			app.setBackgroundImage("view/images/TaskBackground.jpg");
		},

		setTaskContent: function() {
			var sPath = "/UserSet('" + "S001258" + "')/Task";
			this.oTaskModel.read(sPath, {
				success: jQuery.proxy(function(oData) {
					var otaskModel = new sap.ui.model.json.JSONModel(oData.results);
					this.getView().setModel(otaskModel);
				}, this),
				error: jQuery.proxy(function(oError) {
					$.sap.log.error(oError);
				}, this)
			});
		},
		onCreate: function() {
			this.getOwnerComponent().getRouter().navTo("createtask");
		},
		onNavBack: function(oEvent) {
			this.getOwnerComponent().getRouter().navTo("calendar");
		},
		createColumnConfig: function() {
			return [{
				label: 'User',
				property: 'UserID'
			}, {
				label: 'Task Name',
				property: 'TaskName'
			}, {
				label: 'Status',
				property: 'Status'
			}, {
				label: 'Working Hours',
				property: 'Hour'
			}, {
				label: 'Start Date',
				property: 'StartDate'
			}, {
				label: 'End Date',
				property: 'EndDate'
			}];
		},
		onExport: function() {
			var aCols, aProducts, oSettings;

			aCols = this.createColumnConfig();
			aProducts = this.getView().getModel().getProperty("/");

			oSettings = {
				workbook: {
					columns: aCols
				},
				dataSource: aProducts
			};

			new Spreadsheet(oSettings)
				.build()
				.then(function() {
					MessageToast.show("Spreadsheet export has finished");
				});
		}
	});

	return PageController;
});