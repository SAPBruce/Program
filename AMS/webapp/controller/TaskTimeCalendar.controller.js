sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessageBox',
		'sap/viz/ui5/data/FlattenedDataset',
		'sap/viz/ui5/format/ChartFormatter',
		'sap/viz/ui5/api/env/Format'
	],
	function(Controller, JSONModel, MessageBox, FlattenedDataset, ChartFormatter, Format) {
		"use strict";

		var PageController = Controller.extend("AMSTools.controller.TaskTimeCalendar", {

			onInit: function() {
				this.that = this;
				this.getOwnerComponent().getRouter().getRoute("calendar").attachPatternMatched(this._onObjectMatched, this);
				this.oTaskModel = this.getOwnerComponent().getModel();
				// create model
				var oModel = new JSONModel();
				//		oModel.setData(oData_temp);
				this.oData_temp = {
					startDate: new Date(), //start at current day
					people: [{
						pic: "test-resources/sap/ui/demokit/explored/img/John_Miller.png",
						id: "001",
						name: "Bruce Liu",
						role: "team member",
						appointments: [{
							taskid: "001",
							start: new Date("2018", "3", "2", "22", "30"),
							end: new Date("2018", "3", "2", "23", "30"),
							title: "Meet Max Mustermann",
							type: "Type02",
							tentative: false
						}, {
							taskid: "001",
							start: new Date("2017", "0", "11", "10", "0"),
							end: new Date("2017", "0", "11", "12", "0"),
							title: "Team meeting",
							info: "room 1",
							type: "Type01",
							pic: "sap-icon://sap-ui5",
							tentative: false
						}, {
							taskid: "002",
							start: new Date("2017", "0", "12", "11", "30"),
							end: new Date("2017", "0", "12", "13", "30"),
							title: "Lunch",
							info: "canteen",
							type: "Type03",
							tentative: true
						}],
						headers: [{
							start: new Date("2017", "0", "15", "8", "0"),
							end: new Date("2017", "0", "15", "10", "0"),
							title: "Reminder",
							type: "Type06"
						}, {
							start: new Date("2017", "0", "15", "17", "0"),
							end: new Date("2017", "0", "15", "19", "0"),
							title: "Reminder",
							type: "Type06"
						}]

					}]
				};

				this.people = [];
				this.appointments = [];
				//			oModel.setData(this.oData_temp);
				//			this.getView().setModel(oModel);
				this.setBackgroundPicture();
				//		this.setTaskCalendar();

			},
			_onObjectMatched: function() {
				this.setTaskCalendar();
			},
			setTaskAnalyticContent: function() {
				Format.numericFormatter(ChartFormatter.getInstance());
				var formatPattern = ChartFormatter.DefaultPattern;
				var oVizFrame = this.oVizFrame = sap.ui.getCore().byId("idVizFrame");
				oVizFrame.setVizProperties({
					plotArea: {
						dataLabel: {
							formatString: formatPattern.SHORTFLOAT_MFD2,
							visible: true,
							showTotal: false
						},
						dataPointStyle: {
							color: "sapUiChartPaletteSemanticGood"
						}
					},
					valueAxis: {
						label: {
							formatString: formatPattern.SHORTFLOAT
						},
						title: {
							visible: false
						}
					},
					categoryAxis: {
						title: {
							visible: false
						}
					},
					title: {
						visible: false,
						text: 'Revenue by City and Store Name'
					}
				});
				var sPath = jQuery.sap.getModulePath("AMSTools", "/betterMedium.json");
				var dataModel = new JSONModel(sPath);
				oVizFrame.setModel(dataModel);
			},
			setTaskCalendar: function() {
				var sPath = "/UserSet('" + "S001258" + "')/Task";
				this.oTaskModel.read(sPath, {
					success: jQuery.proxy(function(oData) {
						for (var i = 0; i < oData.results.length; i++) {
							this.otasks = {
								"title": "",
								"start": "",
								"end": ""
							};
							this.otasks.title = oData.results[i].TaskName;
							this.otasks.start = oData.results[i].StartDate;
							this.otasks.end = oData.results[i].EndDate;
							this.appointments.push(this.otasks);
						}
						this.oPeople = {
							"name": "Bruce Liu",
							"role": "Team Member",
							"appointments": this.appointments
						};
						this.people.push(this.oPeople);
						var otaskModel = new sap.ui.model.json.JSONModel();
						otaskModel.setData(this.people);
						this.getView().setModel(otaskModel);

					}, this),
					error: jQuery.proxy(function(oError) {
						$.sap.log.error(oError);
					}, this)
				});
			},
			setBackgroundPicture: function() {
				var app = this.getView().byId("timeCalendar_id");
				app.setBackgroundImage("view/images/TaskBackground.jpg");
			},
			handleAppointmentSelect: function(oEvent) {
				var oAppointment = oEvent.getParameter("appointment");
				if (oAppointment) {
					MessageBox.show("Appointment selected: " + oAppointment.getTitle());
				} else {
					var aAppointments = oEvent.getParameter("appointments");
					var sValue = aAppointments.length + " Appointments selected";
					MessageBox.show(sValue);
				}
			},

			handleSelectionFinish: function(oEvent) {
				var aSelectedKeys = oEvent.getSource().getSelectedKeys();
				this.getView().byId("PC1").setBuiltInViews(aSelectedKeys);
			},
			onPress: function() {
				this.getOwnerComponent().getRouter().navTo("task");
			},
			onshow: function() {
				if (this._oDialog) {
					this._oDialog.destroy();
				}
				if (!this._oDialog) {
					this._oDialog = sap.ui.xmlfragment("AMSTools.view.TaskAnalytic", this);

				}
									this.setTaskAnalyticContent();
					this._oDialog.open();

			},
			onClose: function() {
				if (this._oDialog) {
					this._oDialog.close();
				}

			}

		});

		return PageController;

	});