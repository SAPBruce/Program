sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast'
], function(jQuery, Controller, JSONModel, MessageToast) {
	"use strict";

	var PageController = Controller.extend("AMSTools.controller.Main", {

		onInit: function(evt) {
			// set mock model
			var sPath = jQuery.sap.getModulePath("AMSTools", "/data.json");
			var oModel = new JSONModel(sPath);
			this.getView().setModel(oModel);
			this.setBackgroundPicture();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		},

		handleEditPress: function(evt) {
			var oTileContainer = this.getView().byId("container");
			var newValue = !oTileContainer.getEditable();
			oTileContainer.setEditable(newValue);
			evt.getSource().setText(newValue ? "Done" : "Edit");
		},
		handPress: function(oEvent) {
			this.getOwnerComponent().getRouter().navTo("calendar");
			/*			var msg = 'Click Tile';
				MessageToast.show(msg);*/
		},
		handleBusyPress: function(evt) {
			var oTileContainer = this.getView().byId("container");
			var newValue = !oTileContainer.getBusy();
			oTileContainer.setBusy(newValue);
			evt.getSource().setText(newValue ? "Done" : "Busy state");
		},

		handleTileDelete: function(evt) {
			var tile = evt.getParameter("tile");
			evt.getSource().removeTile(tile);
		},
		setBackgroundPicture: function() {
			var app = this.getView().byId("mainPage");
			app.setBackgroundImage("view/images/AMS.jpg");
		}
	});

	return PageController;
});