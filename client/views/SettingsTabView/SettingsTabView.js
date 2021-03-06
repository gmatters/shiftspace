// ==Builder==
// @uiclass
// @package           ShiftSpaceUI
// @dependencies      SSTabView
// ==/Builder==

var SettingsTabView = new Class({
  Extends: SSTabView,
  name: "SettingsTabView",

  initialize: function(el, options)
  {
    this.parent(el, options);
    SSAddObserver(this, "onSync", this.update.bind(this));
    SSAddObserver(this, "onUserLogin", this.update.bind(this));
    SSAddObserver(this, "onUserLogout", this.update.bind(this));
    SSAddObserver(this, "onUserJoin", this.update.bind(this));
    SSAddObserver(this, 'onSpaceInstall', this.onSpaceInstall.bind(this));
  },


  show: function()
  {
    this.parent();
    this.update();
  },


  awake: function()
  {
    this.mapOutletsToThis();
    this.initSelectLanguage();
    this.initInstalledSpacesListView();
    this.clearInstalledButton.addEvent('click', function(evt) {
      evt = new Event(evt);
      SSUninstallAllSpaces();
    });
  },


  afterAwake: function()
  {
    this.parent();
    // NOTE - can't use options because Sandalphon doesn't yet support adding delegates
    // which come from inside an iframe - David 10/27/09
    this.SSInstalledSpaces.setDelegate(this);
    if(ShiftSpaceUser.isLoggedIn()) this.update();
  },


  update: function()
  {
    this.updateInstalledSpaces();
    if(ShiftSpace.User.isLoggedIn())
    {
      this.revealTabByName("PreferencesTab");
      this.revealTabByName("AccountTab");
    }
    else
    {
      this.hideTabByName("PreferencesTab");
      this.hideTabByName("AccountTab");
    }
  },
  
  
  initSelectLanguage: function()
  {
    this.SSSelectLanguage.addEvent('change', function(evt) {
      evt = new Event(evt);
      SSLog("change language", SSLogForce);
      SSLoadLocalizedStrings($(evt.target).getProperty('value'));
    }.bind(this));
  },
  
  
  initInstalledSpacesListView: function()
  {
    if(this.SSInstallSpace)
    {
      this.SSInstallSpace.addEvent('click', function(evt) {
        evt = new Event(evt);
        this.installSpace(this.SSInstallSpaceField.getProperty('value'));
      }.bind(this));
    }
    this.SSInstalledSpaces = this.SSInstalledSpaces;
  },
  
  
  installSpace:function(spaceName)
  {
    SSInstallSpace(spaceName);
  },
  
  
  onSpaceInstall: function()
  {
    this.updateInstalledSpaces();
    this.refreshInstalledSpaces();
  },
  
  
  updateInstalledSpaces: function()
  {
    this.SSInstalledSpaces.setData(SSSpacesByPosition());
    this.SSInstalledSpaces.refresh();
  },
  
  
  refreshInstalledSpaces: function()
  {
    this.SSInstalledSpaces.refresh(true);
  },
  
  
  canRemove: function(sender)
  {
    var canRemove = false;
    switch(sender.listView)
    {
      case this.SSInstalledSpaces:
        this.uninstallSpace(sender.index);
        canRemove = true;
        break;
      default:
        SSLog('No matching list view', SSLogForce);
        break;
    }
    
    return canRemove;
  },
  
  
  uninstallSpace: function(index)
  {
    var spaces = SSSpacesByPosition(), spaceToRemove = spaces[index];
    SSUninstallSpace(spaceToRemove.name);
  },


  showSpaceSettings: function(sender, data)
  {
    SSPostNotification("onShowSpaceSettings", data);
  }
});