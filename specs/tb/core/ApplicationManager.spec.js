define(["tb.core"], function (Core) {
    'use strict';

    describe("ApplicationManager test", function () {
        beforeEach(function () {
            this.appConfig = {
                appPath: 'specs/tb/apps',
                active: 'test',
                route: '',
                applications: {
                    test: {
                        label: 'Test app',
                        config: {}
                    }
                }
            };

            this.appConfigWithError = {
                appPath: 'specs/tb/apps',
                active: 'test',
                route: '',
                applications: {
                    wrong: {
                        label: 'Test app',
                        config: {}
                    }
                }
            };

            this.appConfigWithAltRoutePath = {
                appPath: 'specs/tb/apps',
                active: 'test',
                route: '',
                applications: {
                    wrong: {
                        label: 'Test app',
                        config: {
                            routePath: "wrong.route"
                        }
                    }
                }
            };

            Core.ApplicationManager.reset();
        });
        var errorMessage = function (code, message) {
                return 'Error n°' + code + ' ApplicationManagerException: ' + message;
            };
        it("ApplicationManager.Init throws exception when wrong params are provided", function () {
            try {
                Core.ApplicationManager.init();
                expect(true).toBe(false);
            } catch (e) {
                expect(e).toEqual(errorMessage(50001, "init expects a parameter one to be an object."));
            }

            try {
                Core.ApplicationManager.reset();
                Core.ApplicationManager.init({});
                expect(true).toBe(false);
            } catch (e) {
                expect(e).toEqual(errorMessage(50002, "InvalidAppConfig [appPath] key is missing"));
            }

            try {
                Core.ApplicationManager.init({
                    appPath: "src/tb/apps"
                });
                expect(true).toBe(false);
            } catch (e) {
                expect(e).toEqual(errorMessage(50003, 'InvalidAppConfig [applications] key is missing'));
            }

            try {
                Core.ApplicationManager.init({
                    appPath: "src/tb/apps",
                    applications: {}
                });
                expect(true).toBe(false);
            } catch (e) {
                expect(e).toEqual(errorMessage(50004, 'InvalidAppConfig [active] key is missing'));
            }

            try {
                Core.ApplicationManager.init({
                    appPath: "src/tb/apps",
                    active: "test",
                    applications: {}
                });
                expect(true).toBe(false);
            } catch (e) {
                expect(e).toEqual(errorMessage(50006, 'InvalidAppConfig at least one application config should be provided'));
            }
        });

        it("Should trigger appIsReady event", function (done) {
            var callBack = {
                onInit: function () {return; }
            };
            spyOn(callBack, 'onInit');
            try {
                Core.ApplicationManager.on("appIsReady", callBack.onInit);
                Core.ApplicationManager.init(this.appConfig);
                setTimeout(function () {
                    expect(callBack.onInit).toHaveBeenCalled();
                    done();
                }, 1000);
            } catch (e) {
                expect(false).toBe(true);
            }
        });

        it("Should trigger appLoadingError event", function (done) {
            var callBack = {
                onError: function () {return; }
            };
            spyOn(callBack, 'onError');
            Core.ApplicationManager.reset();
            Core.ApplicationManager.on("appError", callBack.onError);
            try {
                Core.ApplicationManager.init(this.appConfigWithError);
                setTimeout(function () {
                    expect(callBack.onError).toHaveBeenCalled();
                    done();
                }, 500);
            } catch (e) {
                Core.logger.debug(e);
            }
        });

        it("Should trigger routesLoaded event", function (done) {
            var callBack = {
                onRouteReady: function () {
                    return;
                }
            };
            spyOn(callBack, 'onRouteReady').and.callThrough();
            Core.ApplicationManager.reset();
            try {
                Core.ApplicationManager.on("routesLoaded", callBack.onRouteReady);
                Core.ApplicationManager.init(this.appConfig);

                setTimeout(function () {
                    expect(callBack.onRouteReady).toHaveBeenCalled();
                    done();
                }, 500);
            } catch (e) {
                Core.logger.debug(e);
                expect(true).toBe(false);
            }
        });

        it("Should fail because wrong.routes can't be found", function (done) {
            var callBack = {
                routesReady: function () {
                    Core.logger.debug("route has errors");
                },
                appError: function () {
                    Core.logger.debug("appError because a route can't be found");
                }
            };
            spyOn(callBack, "routesReady");
            spyOn(callBack, "appError").and.callThrough();
            Core.ApplicationManager.reset();
            Core.ApplicationManager.on("routesLoaded", callBack.routesReady);
            Core.ApplicationManager.on("appError", callBack.appError);
            Core.ApplicationManager.init(this.appConfigWithAltRoutePath);

            setTimeout(function () {
                expect(callBack.routesReady).not.toHaveBeenCalled();
                expect(callBack.appError).toHaveBeenCalled();
                done();
            }, 1000);
        });

        /* all appManager lifecycle ...*/
        describe("Application life cycle", function () {
            var layoutApp,
                contentApp,
                currentApp,
                barAction = false,
                callBack;

            beforeEach(function () {
                Core.ApplicationManager.reset();
                layoutApp = null;
                contentApp = null;
                currentApp = null;
                callBack = {
                    layoutIsLaunched: function (app) {
                        layoutApp = app;
                        currentApp = app;
                    },
                    contentIsLaunched: function (app) {
                        contentApp = app;
                        currentApp = app;
                    },
                    lastAppIsLaunched: function (app) {
                        currentApp = app;
                    },
                    appFailToLaunch: function () {Core.logger.debug("$noop"); },
                    appHasError: function () {Core.logger.debug("$noop"); }
                };
                /*app Layout*/
                try {
                    Core.ApplicationManager.registerApplication("LayoutApplication", {
                        onInit: function () {Core.logger.debug("$noop"); },
                        onStart: function () {Core.logger.debug("$noop"); },
                        onStop: function () {Core.logger.debug("$noop"); },
                        onResume: function () {Core.logger.debug("$noop"); },
                        onError: function () {Core.logger.debug("$noop"); }
                    });

                    /*app Content*/
                    Core.ApplicationManager.registerApplication("ContentApplication", {
                        onInit: function () {Core.logger.debug("$noop"); },
                        onStart: function () {Core.logger.debug("$noop"); },
                        onStop: function () {Core.logger.debug("$noop"); },
                        onResume: function () {Core.logger.debug("$noop"); },
                        onError: function () {Core.logger.debug("$noop"); }
                    });

                    /*app Last*/
                    Core.ApplicationManager.registerApplication("LastApplication", {
                        onInit: function () {
                            Core.logger.debug("onInit is Started");
                        },
                        onStart: function () {Core.logger.debug("$noop"); },
                        onStop: function () {Core.logger.debug("$noop"); },
                        onResume: function () {Core.logger.debug("$noop"); },
                        onError: function () {Core.logger.debug("$noop"); }
                    });

                    /* register a controller ContentApplication*/
                    Core.ControllerManager.registerController('ContentController', {
                        appName: 'LastApplication',
                        config: {
                            imports: []
                        },
                        onInit: function () {
                            Core.logger.debug("inside ContentController");
                        },
                        fooAction: function () {
                            this.value = 'foo';
                        },
                        barAction: function () {
                            this.value = 'bar';
                            barAction = 'bar';
                        }
                    });
                } catch (e) { Core.logger.debug(e); }
            });

            it("Should fail because application already exists", function () {
                try {
                    Core.ApplicationManager.registerApplication("LayoutApplication", {
                        onInit: function () {Core.logger.debug("$noop"); },
                        onStart: function () {Core.logger.debug("$noop"); },
                        onStop: function () {
                            Core.logger.debug("onStop radical once");
                        },
                        onResume: function () {Core.logger.debug("$noop"); },
                        onError: function () {Core.logger.debug("$noop"); }
                    });
                    expect(true).toBe(false);
                } catch (e) {
                    expect(e).toEqual(errorMessage(50007, 'An application named [LayoutApplication] already exists.'));
                }
            });

            it("Should create an application", function (done) {
                spyOn(callBack, 'layoutIsLaunched').and.callThrough();
                spyOn(callBack, 'contentIsLaunched').and.callThrough();
                /* launch LayoutApplication */
                Core.ApplicationManager.launchApplication("LayoutApplication", {}).done(callBack.layoutIsLaunched).fail(callBack.appFailToLaunch);
                setTimeout(function () {
                    spyOn(layoutApp, 'onResume').and.callThrough();
                    spyOn(layoutApp, 'onInit').and.callThrough();
                    spyOn(layoutApp, 'onStop').and.callThrough();
                    expect(callBack.layoutIsLaunched).toHaveBeenCalled();
                    expect(layoutApp).not.toBeUndefined();
                    expect(layoutApp.getName()).toEqual("LayoutApplication");
                    /* Then launch ContentApplication */
                    Core.ApplicationManager.launchApplication("ContentApplication", {}).done(callBack.contentIsLaunched).fail(callBack.appFailToLaunch);
                    expect(callBack.contentIsLaunched).toHaveBeenCalled();
                    spyOn(contentApp, 'onStop').and.callThrough();
                    spyOn(contentApp, 'onResume').and.callThrough();
                    expect(contentApp).not.toBeUndefined();
                    expect(contentApp.getName()).toEqual("ContentApplication");
                    expect(layoutApp.onStop).toHaveBeenCalled();
                    layoutApp.onStop.calls.reset(); //clean spies
                    /* Then lauch LayoutApplication */
                    Core.ApplicationManager.launchApplication("LayoutApplication", {}).done(callBack.layoutIsLaunched).fail(callBack.appFailToLaunch);
                    expect(currentApp.getName()).toEqual("LayoutApplication");
                    expect(layoutApp.onInit).not.toHaveBeenCalled();
                    expect(layoutApp.onStop).not.toHaveBeenCalled();
                    expect(contentApp.onStop).toHaveBeenCalled();
                    expect(layoutApp.onResume).toHaveBeenCalled();
                    contentApp.onStop.calls.reset();
                    /*And then switch from Content TO LayoutApplication */
                    Core.ApplicationManager.launchApplication("ContentApplication", {}).done(callBack.contentIsLaunched).fail(callBack.appFailToLaunch);
                    expect(currentApp.getName()).toEqual("ContentApplication");
                    expect(layoutApp.onStop).toHaveBeenCalled();
                    expect(contentApp.onStop).not.toHaveBeenCalled();
                    done();
                }, 1000);
            });

            it("ApplicationManager.invoke should throw an error when no parameter is provided", function (done) {
                Core.ApplicationManager.launchApplication("ContentApplication", {}).done(callBack.contentIsLaunched).fail(callBack.appFailToLaunch);
                setTimeout(function () {
                    try {
                        Core.ApplicationManager.invoke();
                    } catch (e) {
                        expect(e).toEqual(errorMessage(50009, 'Application.invoke actionInfos should be a string'));
                    }
                    done();
                }, 1000);
            });

            it("ApplicationManager.invoke should throw an error when wrong parameters are provided", function (done) {
                Core.ApplicationManager.launchApplication("ContentApplication", {}).done(callBack.contentIsLaunched).fail(callBack.appFailToLaunch);
                setTimeout(function () {
                    try {
                        Core.ApplicationManager.invoke("radical blaer");
                        expect(true).toBe(false);
                    } catch (e) {
                        expect(e).toEqual(errorMessage(50010, 'Invalid actionInfos. Valid format {appname}:{controllerName}:{controllerAction}'));
                    }
                    done();
                }, 1000);
            });

            it("ApplicationManager.invoke should fail if the app provided can't be found", function (done) {
                var hasError = false;
                Core.ApplicationManager.on("appError", function () {
                    hasError = true;
                });
                Core.ApplicationManager.launchApplication("ContentApplication", {}).done(callBack.contentIsLaunched).fail(callBack.appFailToLaunch);
                Core.ApplicationManager.invoke("ContentApplsication:ContentController:barAction");
                setTimeout(function () {
                    expect(hasError).toEqual(true);
                    done();
                }, 1000);
            });

            it("Application.invoke should fail if controller can't be found", function (done) {
                var controllerHasError = false;
                Core.ApplicationManager.reset();
                Core.ApplicationManager.on("appError", function () {
                    controllerHasError = true;
                });
                Core.ApplicationManager.launchApplication("LastApplication", {}).fail(function (reason) {
                    Core.logger.debug(reason);
                    Core.logger.debug("Error:" + reason);
                });
                Core.ApplicationManager.invoke("LastApplication:ContenstController:bar");
                setTimeout(function () {
                    expect(controllerHasError).toBe(true);
                    done();
                }, 1000);
            });

            it("Application.invoke should fail if controller action can't be found", function (done) {
                var controllerHasError = false;
                Core.ApplicationManager.reset();
                Core.ApplicationManager.on("appError", function (e) {
                    controllerHasError = true;
                    Core.logger.debug(e);
                });
                Core.ApplicationManager.launchApplication("LastApplication", {}).fail(function (reason) {
                    Core.logger.debug(reason);
                    Core.logger.debug("Error:" + reason);
                });
                Core.ApplicationManager.invoke("LastApplication:ContentController:baz");
                setTimeout(function () {
                    expect(controllerHasError).toBe(true);
                    done();
                }, 1000);
            });

            it("Application.invoke should execute Controller action", function (done) {
                Core.ApplicationManager.on("appError", function () {Core.logger.debug("$noop"); });
                Core.ApplicationManager.launchApplication("LastApplication", {}).fail(function (reason) {
                    Core.logger.debug("Error:" + reason);
                });
                Core.ApplicationManager.invoke("LastApplication:ContentController:bar");
                setTimeout(function () {
                    expect(barAction).toEqual("bar");
                    done();
                }, 1000);
            });
        });
    });
});