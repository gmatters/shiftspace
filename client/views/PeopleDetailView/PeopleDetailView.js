// ==Builder==
// @uiclass
// @package           ShiftSpaceUI
// @dependencies      SSView
// ==/Builder==

var PeopleDetailView = new Class({
  Extends: SSView,
  name: "PeopleDetailView",

  initialize: function(el, options)
  {
    this.parent(el, options);
  },


  awake: function()
  {
    this.attachEvents();
  },


  attachEvents: function()
  {
    this.element.getElement(".follow").addEvent("click", function() {
      var controlp = SSApp.post({
        "resource":"user",
        "id":this.currentUser.userName,
        "action":"follow"
      });
      this.toggleFollowButtons(true, controlp);
    }.bind(this));

    this.element.getElement(".unfollow").addEvent("click", function() {
      var controlp = SSApp.post({
        "resource":"user",
        "id":this.currentUser.userName,
        "action":"unfollow"
      });
      this.toggleFollowButtons(false, controlp);
    }.bind(this));
  },


  showUser: function(userData)
  {
    this.currentUser = userData;
    ['userName',
     'bio',
     'url',
     'followerCount',
     'followingCount',
     'shiftCount'].each(function(prop) {
       this.element.getElement("."+prop).set("text", userData[prop]);
    }, this);
    this.element.getElement(".gravatarLarge").setProperty("src", userData.gravatarLarge);
    this.toggleFollowButtons(userData.following);
  },


  toggleFollowButtons: function(isFollowing)
  {
    if(isFollowing)
    {
      this.element.getElement(".follow").addClass("SSDisplayNone");
      this.element.getElement(".unfollow").removeClass("SSDisplayNone");
    }
    else
    {
      this.element.getElement(".follow").removeClass("SSDisplayNone");
      this.element.getElement(".unfollow").addClass("SSDisplayNone");
    }
  }.asPromise()
});
