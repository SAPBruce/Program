sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast'
], function(jQuery, Controller, JSONModel, MessageToast) {
	"use strict";

	var PageController = Controller.extend("AMSTools.controller.CreateTask", {

		onInit: function(evt) {
			this.oView = this.getView();
			this.oTaskModel = this.getOwnerComponent().getModel();
			this.setBackgroundPicture();
		},
		handleEndChange: function() {
			var startDate = this.oView.byId("StartDate_id").getValue();
			var endDate = this.oView.byId("EndDate_id").getValue();
			var hours = (new Date(endDate) - new Date(startDate)) / 3600000;
			this.oView.byId("WorkHours_id").setValue(hours);

		},
		onCancel: function() {
			this.getOwnerComponent().getRouter().navTo("task");
		},
		setBackgroundPicture: function() {
			var app = this.getView().byId("noteTask_id");
			app.setBackgroundImage("view/images/TaskBackground.jpg");
		},
		onSave: function() {
			var userID = this.oView.byId("Employee_id").getValue(),
				taskUUID = this._createGuid(),
				taskName = this.oView.byId("TaskName_id").getValue(),
				start_Date = this.oView.byId("StartDate_id").getValue(),
				end_Date = this.oView.byId("EndDate_id").getValue(),
				startDate_temp = new Date(start_Date),
				endDate_temp = new Date(end_Date);
			var oTasks = {
				"UserID": userID,
				"TaskUUID": taskUUID,
				"TaskName": taskName,
				"StartDate": startDate_temp,
				"EndDate": endDate_temp
			};
			this.oView.setBusy(true);
			this.oTaskModel.create("/TaskSet",
				oTasks, {
					success: jQuery.proxy(function(oData) {
						MessageToast.show("Task has been saved");
						this.oView.setBusy(false);
					}, this),
					error: jQuery.proxy(function(oError) {
						$.sap.log.error(oError);
						MessageToast.show("Transaction cannot be created in the backend system");
						this.oView.setBusy(false);
					}, this)
				});
		},
		_createGuid: function() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random() * 16 | 0,
					v = c === 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		},

	});

	return PageController;
});