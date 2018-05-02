sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function(Controller, MessageToast) {
	"use strict";

	return Controller.extend("Upload_Download.controller.main", {
		onInit: function() {
			this._oODataModel = this.getOwnerComponent().getModel();
		},
		onUpload: function() {
			var oController = this;
			var dialog = new sap.m.Dialog({
				title: "Upload File",
				type: "Message",
				content: [
					new sap.m.Label({
						text: "Scope",
						labelFor: "submitDialogTextarea"
					}),
					new sap.m.Input("submitDialogTextarea", {
						liveChange: function(oEvent) {
							var sText = oEvent.getParameter("value");
							var parent = oEvent.getSource().getParent();

							parent.getBeginButton().setEnabled(sText.length > 0);
						},
						width: "100%",
						placeholder: "Scope"
					}),
					new sap.m.Label({
						text: "Decription",
						labelFor: "des"
					}),
					new sap.m.Input("des", {
						width: "100%",
						placeholder: "1;2;3....."
					})
				],
				beginButton: new sap.m.Button({
					text: "Upload",
					enabled: false,
					press: function() {
						var sText = sap.ui.getCore().byId('submitDialogTextarea').getValue();
						var sDes = sap.ui.getCore().byId('des').getValue();
						oController._onUploadFile(sText, sDes);
						// MessageToast.show("Note is: " + sText);
						dialog.close();
					}
				}),
				endButton: new sap.m.Button({
					text: "Cancel",
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
		},
		onDownload: function(oEvent) {
			var oPic = oEvent.getSource().getBindingContext("pics").getObject();
			var sPath = "/PictureSet(Scope='" + oPic.Scope + "',Name='" + oPic.Name + "')";
			var sFileHref = this._getOdataServiceURL(sPath) + "/$value";
			window.open(sFileHref);

		},
		_getOdataServiceURL: function(sEntity) {
			var oDataRoot = this.getOwnerComponent().getModel().sServiceUrl;
			return oDataRoot + "/" + sEntity;

		},
		_onUploadFile: function(scope, des) {

			var oController = this;
			var fileData = {
				name: "",
				contentType: "",
				value: "",
				scope: scope,
				description: des
			};

			var oFileUpload = this.getView().byId("fileUploader");
			// var msgText = this.oSourceBundle.getText("noFile");
			if (!oFileUpload.getValue()) {
				sap.m.MessageToast.show("Please choose a file");
				return;
			}
			fileData.name = oFileUpload.getValue();
			var file = jQuery.sap.domById(oFileUpload.getId() + "-fu").files[0];
			fileData.contentType = file.type;
			// var base64_marker = 'data:' + file.type + ';base64,';
			var reader = new FileReader();

			/*file on load*/
			reader.onload = function() {
				var value = oController._formatFileValue(this.result);
				fileData.value = value;
				//add content in the file table
				// oController.oFileList.push(fileData);
				oController.uploadAttachment(fileData);
			};
			reader.readAsDataURL(file);

		},
		_formatFileValue: function(data) {
			var sValue = data.split("base64,")[1];
			if (sValue) {
				var value = sValue.split("</pre>")[0];
				return value;
			}
			return data.split("base64,")[0];
		},
		uploadAttachment: function(fileData) {
			var oController = this;
			var url;
			//set slug
			var file = fileData;
			this.FileName = file.name;
			this.Scope = file.scope;
			this.Description = file.description;
			var keyList = ["FileName", "Scope", "Description"];
			var slugContent = '[{';
			for (var i = 0; i < keyList.length; i++) {
				slugContent = slugContent + '"' + keyList[i] + '": "' + this[keyList[i]] + '"';
				if (i !== keyList.length - 1) {
					slugContent = slugContent + ',';
				}
			}
			slugContent = slugContent + '}]';

			var method = "Post";
			if (window.sap.ushell.cloudServices) {
				var doorWayPath = window.sap.ushell.cloudServices.interceptor.FilterManager.getInstance().getRegisteredFilters()[2].doorwayPath;
				url = window.location.origin + doorWayPath + "/sap/opu/odata/sap/ZAMSTOOLS_SRV/PictureSet";
			} else {
				url = window.location.origin + "/sap/opu/odata/sap/ZAMSTOOLS_SRV/PictureSet";
			}
			var scrfToken = oController._oODataModel.oHeaders["x-csrf-token"];
			if (!scrfToken) {
				this._oODataModel.refreshSecurityToken();
				scrfToken = this._oODataModel.oHeaders["x-csrf-token"];
			}
			this.getView().setBusy(true);
			$.ajax({
				type: method,
				url: url,
				data: file.value,
				contentType: file.contentType,
				beforeSend: jQuery.proxy(function(XMLHttpRequest) {
					XMLHttpRequest.setRequestHeader("x-csrf-token", scrfToken);
					XMLHttpRequest.setRequestHeader("slug", slugContent);
				}, this),
				success: jQuery.proxy(function(data) {
					MessageToast.show("File has been uploaded");
					this._getPictures();
					this.getView().setBusy(false);
				}, this),
				error: jQuery.proxy(function() {
					this.getView().setBusy(false);
				}, this)
			});

		},
		_getPictures: function() {
			var sPath = "/PictureSet";
			var oModel = this._oODataModel;
			oModel.read(sPath, {
				success: jQuery.proxy(function(oData) {
					// this.aQuestions = oData.results;
					var oJsonModel = new sap.ui.model.json.JSONModel();
					oJsonModel.setData(oData.results);
					this.getView().setModel(oJsonModel, "pics");
				}, this),
				error: jQuery.proxy(function(oError) {
					$.sap.log.error(oError);
				}, this)
			});
		},
	});
});