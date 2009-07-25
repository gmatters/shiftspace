// ==Builder==
// @uiclass
// @package           Calendar
// @dependencies      SSView, DatePicker
// ==/Builder==

var SSCalendar = new Class({

  Extends: SSView,
  name: 'SSCalendar',
  
  defaults: function()
  {
    return $merge(this.parent(), {
     displayOptions: null 
    });
  },

  initialize: function(el, options)
  {
    this.parent(el, options);
    new DatePicker(this.element, this.options.displayOptions);
  }
});