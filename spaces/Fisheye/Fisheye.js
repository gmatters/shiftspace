

var wrapSetHTML =  function(el, html) {
    if (typeof (el.setHTML) != 'undefined') {
	    el.setHTML(html);
    } else if (typeof (el.set) != 'undefined') {
	    el.set("html", html);
    }
    // TODO: alert if supports neither
}

// Get the latest plugins, languages, and layout from SVN
//var feRoot="http://metatron.shiftspace.org/code/trunk/spaces/Fisheye/";
var feRoot="http://fisheye.ffem.org/shiftspace_0.5_nov_2008/spaces/Fisheye/";

var makeTextBox = function(target, text) {
    var usrBox = new ShiftSpace.Element('div');
    usrBox.appendText(text);
    usrBox.injectInside(target);
    return usrBox;
}

// Some convenience funcs
var makeNoteBox = function (container) {
    var nb = new ShiftSpace.Element('div', {'class' : 'FisheyeNoteBox'});
    if (container)
	nb.injectInside(container);
    return nb;
}

var makeButton = function(label, container, callbackFunc) {
    var ab = new ShiftSpace.Element( 'input', {
	type : 'button', 'class' : 'FisheyeNoteShiftButton',
	value : label,
    });
    if (container)
        ab.injectInside(container);
    if (callbackFunc)
	ab.addEvent('click', callbackFunc);
    return ab;
}

var makeDisplayItem = function(target) {
    var ad = new ShiftSpace.Element('div', { 'class' : 'FisheyeDisplayItem' });
    if (target)
	ad.injectInside(target);
    return ad;
}

var addImage = function(imguri, container) {
	imageBox = new ShiftSpace.Element('div');
	wrapSetHTML(imageBox, '<img src="' + imguri + '" />');
	imageBox.injectInside(container);
}


/* Define a render class. This allows it to be extended, so that special
 * types (eg NewsTrust) can extend this and override some funcs to
 * customize rendering and interface.  Render funcs all take 'that'
 * as first argument, this is a FisheyeShift object equivalent to
 * 'this' in the main class code */
var FisheyeCriticismRenderClass = new Class({

    appendMode: function(that, target, txt) {
	if (!that.haveSaved)
	  txt += " (draft)";
	else
	  txt += that.modes[that.mode].iconNote;
	target.appendText(txt); // TODO: only if not empty?
    },

    // Render the icon, the only thing visible until user mouses over
    renderIcon: function(that, target) {
	this.appendMode(that, target, that.iconText);
    },

    renderCategory: function(that, isEdit, container) {
	//var someBox = new ShiftSpace.Element('div', {'class':'FisheyeCategory'});
	var categoryText = that.criticismCategoryGetName (that.categoryType);

	if (isEdit) {
	    var someBox = new ShiftSpace.Element('div', {'class':'FisheyeEditableText'});
	    someBox.setStyles({ 'class': 'FisheyeEditableText', });

	    that.someList = new ShiftSpace.Element('select', 
		{'class':'FisheyeEditableText',
		 'name':'mylist'}
	    );
	    for (var key in that.criticismCategories) {
	      var someOption = new ShiftSpace.Element('option', {'value':key});
	      someOption.setStyles({
		  'color': 'white',
		  'background-color': that.criticismCategoryGetColor(key),
	      });
	      someOption.appendText(key + " : " + that.criticismCategoryGetName(key));
	      someOption.injectInside(that.someList);
            }
	    that.someList.value = that.categoryType;
	    that.someList.addEvent('change', function(){
		    var w = this.someList.selectedIndex;
		    var key = this.someList.options[w].value;
		    this.setCategory(key);
		}.bind(that));
	    that.someList.injectInside(container);
	}
	else {
	    var someBox = new ShiftSpace.Element('div', {'class':'FisheyeCategory'});
	    someBox.appendText(categoryText);
	    someBox.injectInside(container);
	}

	//someBox.injectInside(container);
    },

    // Render the summary, the main text body of popup
    // in edit mode, render an entry box
    renderSummary: function(that, isEdit, de) {
        log("RENDER SUMMARY CALLED");
	if (isEdit) {
	    log("RENDER SUMMARY SIMPLE IN EDIT MODE");
	    that.buildInputArea();
	    that.inputArea.injectInside(that.editBox);
	} else {
	    log("RENDER SUMMARY DISPLAY MODE");
	    var sBox = new ShiftSpace.Element ('div', {'class':'FisheyeSummary'});
	    sBox.appendText(that.summaryText);
	    sBox.injectInside (that.detailsBox);
	}
    },

    renderLinkBox: function(that, isEdit, container) {
	var criticismLinkBox = new ShiftSpace.Element('div', {
		'padding':  '0px 5px 10px 5px',
	});
	criticismLinkBox.injectInside(container);
	if (isEdit) {
	    aBox = new ShiftSpace.Element('div', {'class':'FisheyeEditableText'});
	    aBox.setStyles({ 'font-weight': 'bold', });
	    aBox.appendText(that.criticismLink);
	    aBox.addEvent('click', that.changeCriticismLink.bind(that));
	    aBox.injectInside(criticismLinkBox);
	} else {
	    aBox = new ShiftSpace.Element('div', {'class':'FisheyeDisplayItem'});
	    aBox.setStyles({ 'font-weight': 'bold', });
	    aLink = this.createLink (that.criticismLink, "[" + that.getText('read') + "]", aBox);
	    aBox.injectInside(criticismLinkBox);
	}
    },

    renderSource: function(that, target) {
	var sb = makeDisplayItem();
	name = that.criticismSourceGetName (that.sourceCode);
	//sb.appendText(that.getText('source') + ": " + name + " [" + that.getText('ignore') + "]");
	sb.appendText(that.getText('source') + ": " + name + " ");
	var ignoreButton = new ShiftSpace.Element('span', { 'class' : 'FisheyeActiveText' });
	//ignoreButton.appendText("[ignore this source]");
	ignoreButton.appendText("[" + that.getText('ignore') + that.getText('source') + "]");
	ignoreButton.addEvent('click', function(){
	    this.settings.hiddenSources[this.sourceCode] = true;
	    this.saveSettings();
	    this.rebuild();
	}.bind (that));
	ignoreButton.injectInside(sb);
	sb.injectInside(target);
    },

    getDisplaySummary: function(that) {
	return that.summaryText;
    },

    changeLinkPrompt : "Link to criticism:",

	// XXX: styles should come from class but empirically fails...
    createLink: function(aHref, text, container) {
	var aLink = new ShiftSpace.Element('a', {
	    'class' : 'FisheyeLinkItem',
	    'styles': {
		    'background-color' : '#F5FB9B',
		    'color': '#00F',
		    'font-weight': 'bold',
		    'display' : 'inline',
	    },
	    'href' : aHref
	});
	aLink.appendText(text);
	if (container)
	    aLink.injectInside(container);
	return aLink;
    },
});
var FisheyeDefaultRenderClass = new FisheyeCriticismRenderClass();


// A global handle to the spaces libs - allows lib data to be accessed without referencing a shift
var globalLibsHandle = null;


var FisheyeShift = new Class({
	Extends: ShiftSpace.Shift,

    /*
	 Categories Static Data
    */



    criticismCategories: {
    			// Hard Failure - red
		0: {'name':'Factual Error', 'color':'#F00'},
		1: {'name':'Logical Fallacy', 'color':'#F33'},
		2: {'name':'Misleading', 'color':'#F66'},
			// Soft Failure - Orange / Yellow
		3: {'name':'Unchallenged Quote', 'color':'#F90'},
		4: {'name':'Unexplained Contradiction', 'color':'#EE0'},
		5: {'name':'Bias In Presentation', 'color':'#F0F'},
		6: {'name':'Projecting Motive', 'color':'#939'},
			// Neutral - blue
		7: {'name':'Context', 'color':'#33F'},
		8: {'name':'Differing Viewpoint', 'color':'#55F'},
			// Positive - green
		9: {'name':'Supplementary Information', 'color':'#5F5'},
			// Embedded systems
    },

    criticismCategoryGetName: function(idx) {
        var translatedName = FisheyeTranslation.getCriticismCategoryName(idx, this.settings.language);
	if (translatedName != null)
	  return translatedName;
    	else if (this.criticismCategories[idx] &&
    	         this.criticismCategories[idx].name)
	  return this.criticismCategories[idx].name;
	else
	  return "LOADING";
    },

    criticismCategoryGetColor: function(idx) {
    	if (this.criticismCategories &&
    	    this.criticismCategories[idx] &&
    	    this.criticismCategories[idx].color)
    	    return this.criticismCategories[idx].color;
	return '#AAA';
    },


    /*
	 Sources Static Data
    */

    criticismSources: {
		0: {'name' : 'Unknown'},
		1: {'name' : 'Media Matters',
		    'homepage' : 'http://mediamatters.org/'},
		2: {'name' : 'FAIR',
		    'homepage' : 'http://fair.org/'},
		3: {'name' : 'ThinkProgress',
		    'homepage' : 'http://thinkprogress.org/'},
		4: {'name' : 'NewsTrust',
		    'homepage' : 'http://newstrust.net/'},
    },

    criticismSourceGetName: function(idx) {
    	if (this.criticismSources[idx] &&
    	    this.criticismSources[idx].name)
	    return this.criticismSources[idx].name;
	else
	    return "LOADING";
    },

    criticismSourceFromLink: function(uri) {
	for (var key in this.criticismSources) {
	    if (uri.match(this.criticismSources[key].homepage)) {
		return key;
	    }
	}
    	return 0;
    },



    // Define different modes that the shift might be in: display, edit, config..
    modes: {
	0: {'name' 	: 'Display',
	    'iconNote' 	: ''},
	1: {'name' 	: 'Edit',
	    'iconNote' 	: ' (edit)',
	    onSave 	: function() {
		this.haveSaved = 1;
		this.updateAnchoredIconPosition(); // In case shift was dragged, update anchored icon position
	        this.anchoredIcon.removeClass('FisheyeHidden');
		this.save();
		this.setMode (this.MODE_DISPLAY);
		FisheyeConsole.updateConsole(this);
	    },
	    onCancel 	: function() {
                log ("onCancel, EDIT mode");
		if (this.haveSaved) {
	            this.anchoredIcon.removeClass('FisheyeHidden');
		    this.loadStoredData(this.json);
		    this.setMode (this.MODE_DISPLAY);
		} else {
	            this.anchoredIcon.addClass('FisheyeHidden');
		    this.hide(); // Cancel an unsaved new note
		}
	    },
	    onRange 	: function() { 
		log("onRange");
		if (window.getSelection) {
		    var mySel = window.getSelection();
		    if (mySel.rangeCount > 0) {
			this.posRange = mySel.getRangeAt(0);
		// XXX: flatten only on render?  better origText....
			this.posRange.collapse(false); // flatten to endpoint
			// XXX: only on save??  need policy....
			this.posRef = ShiftSpace.RangeCoder.toRef (this.posRange);
			// Render only *AFTER* making ref, else our content will
			// be part of ref and break shift load...
			//this.renderRange(this.posRange);
		    } else {
			alert (this.getText('rangeWarning'));
		    }
		}
	    },
	    makeButtons : function(that) {
		var di = makeDisplayItem(that.editBox);
		makeButton(that.getText('save'), di, this.onSave.bind(that));
		makeButton(that.getText('cancel'), di, this.onCancel.bind(that));
	    },
	  },
	2: {'name'	: 'Settings',
	    'iconNote'	: ' (config)',
	    onSave 	: function() {
		this.saveSettings();
		this.setMode (this.MODE_DISPLAY);
	    },
	    onCancel 	: function() {
		this.loadSettings();
		this.setMode (this.MODE_DISPLAY);
	    },
	    makeButtons : function(that) {
		var di = makeDisplayItem(that.settingsBox);
		makeButton(that.getText('save'), di, this.onSave.bind(that));
		makeButton(that.getText('cancel'), di, this.onCancel.bind(that));
	    },
	    fillBody	: function(that, container) {
		if (that.settingsLayout) {
		    that.settingsBox = makeNoteBox(container);
		    wrapSetHTML(that.settingsBox, that.settingsLayout);
		    that.preProcessLayout (that.settingsBox);
		} else {
		    that.settingsBox = makeNoteBox(container);
		    if (that.isProxy())
		        wrapSetHTML(that.settingsBox, "Settings disabled in proxy mode");
		    else
		        wrapSetHTML(that.settingsBox, "MISSING LAYOUT");
		}
	    },
	  },
	3: {'name'	: 'Help',
	    'iconNote'	: ' (help)',
	    onDone 	: function() { this.setMode (this.MODE_DISPLAY); },
	    makeButtons : function(that) {
		var di = makeDisplayItem(that.helpBox);
		makeButton(that.getText('done'), di, this.onDone.bind(that));
	    },
	    fillBody	: function(that, container) {
		that.helpBox = makeNoteBox(container);
		that.helpBox.appendText("."); // XXX
		var br = new ShiftSpace.Element('br');
		br.injectInside(that.helpBox);
	        aLink = that.renderClass.createLink ("http://fisheye.ffem.org/help.html", "click here to view help on website", that.helpBox);
	    },
	  },
    },


      // Given a DOM object, parse through the elements and apply
      //  * translations
      //  * funcs to fill in dynamic content
    preProcessLayout : function (domObject) {
      var listitems = domObject.getElementsByTagName("*");
      for (i=0; i<listitems.length; i++) {
	  el = listitems[i];
	  if (el.hasAttribute('fisheyeText'))
	      el.firstChild.nodeValue = this.getText(el.getAttribute("fisheyeText"));
	  else if (el.hasAttribute('fisheyeFunc'))
	      this[el.getAttribute("fisheyeFunc")](el);
	  else if (el.hasAttribute('fisheyeUserName'))
	      el.firstChild.nodeValue = this.getUserName();
      }
    },

    modeGetName : function(key) {
        translatedName = FisheyeTranslation.getModeName(key, this.settings.language);
	if (translatedName != null)
	  return translatedName;

	return this.modes[key].name;
    },

    // Get text for display, current language if possible or default to English
    getText: function(word) {
        return FisheyeTranslation.getText(word, this.settings.language);
    },

    // Allow shift to serve as handle to a few local funcs
    wrapSetHTML: function(el, html) { wrapSetHTML(el, html); },

    dumpObj: function (someObj) {
	for (var key in someObj) {
	  log("" + key + " : " + someObj[key]);
	}
    },

    updatePosition: function() {
	    var pos = this.anchoredIcon.getPosition();
	    log("updatePosition() toooo anchored icon position " + pos.x + "," + pos.y);
	    setElementPosition(this.element, pos.x, pos.y);
    },

    // Update anchored icon position to match shift, e.g. if shift was dragged
    // Only handles the case that shift is not locked to text
    updateAnchoredIconPosition: function() {
	if (!this.posRange) {
	    var pos = this.getPosition();
	    log("updateAnchoredIconPosition() to shift position " + pos.x + "," + pos.y);
	    setElementPosition(this.anchoredIcon, pos.x, pos.y);
	}
    },

    renderRange: function(reRange) {
	var oSpan = new ShiftSpace.Element('div');
	this.anchoredIcon = oSpan;
	this.refreshStyle(oSpan);
	this.renderClass.renderIcon(this, oSpan);
	oSpan.addEvent('mouseover', this.onMouseIn.bind(this));
	if (this.posRange) {
	  log("renderRange: has posRange ");
	  if (this.posRange.insertNode) {
	      oSpan.style.display = "inline";
	      this.posRange.insertNode(oSpan);
	      this.updatePosition();
	  } else {
	      log("tried to render invalid range");
	  }
	} else {
	  log("renderRange: did not have posRange ");
	  log("renderRange: setting anchoredIcon position to " + this.json.position.x + "," + this.json.position.y);
	    setElementPosition(oSpan, this.json.position.x, this.json.position.y);
            oSpan.injectInside(document.body);
        }
        log("renderRange: done ");
    },


    loadStoredData: function(json) {

	// Load shift data from JSON
	this.haveSaved = json.haveSaved || 0;  // TODO: only on initial load?
        log("loadStoredData: this.haveSaved '" + this.haveSaved + "' from json.haveSaved '" + json.haveSaved + "'");
	this.criticismLink = json.criticismLink || "http://a.org/some.html";
	this.summaryText = json.summaryText || this.getText('defaultText');
	this.categoryType = json.categoryType || 0;
	this.sourceCode = json.sourceCode || 0;

	// Initialize based on loaded data
	this.renderClass = this.refreshRenderClass();
	    // XXX: does "shown" still make sense?
	this.shown = this.haveSaved ? false : true;
    },



    continueInitialize: function() {

	// XXX: how to handle default language?
	if (!this.settings.language)
	    this.settings.language = 'en';

	// Static data
	this.iconText = "F";

	this.loadStoredData(this.json);

	// The we sometimes need to access these modes directly in code
	this.MODE_DISPLAY = 0;
	this.MODE_EDIT = 1;
	this.mode = this.MODE_DISPLAY;

	if (this.shouldIgnoreShift()) {
	  log("continueInitialize: ignoring shift");
	  // XXX: should register with the summary panel, panel should say 'N ignored'
	  return;
	} else {
	  log("continueInitialize: NOT ignoring shift");
	}

        this.build(this.json);

	this.rebuildLock();

	sources = this.getParentSpace().attributes().lib.sources
	for (var key in sources) {
	  if (key != "sources.js") { // XXX
	    log("source key " + key);
	    thisSource = eval(sources[key]); // XXX: this relies on implementation detail; eval pulls variables into local name space; we should assign a classname derived from the filename
	    if (thisSource) {
		this.criticismCategories[thisSource.key] = {
			'name':thisSource.name, 
			'color':thisSource.color, 
			'renderClass':thisSource.renderClass, };
		log("loaded source " + thisSource.key + ":" + thisSource.name);
		if (this.categoryType == thisSource.key)
		    this.renderClass = this.refreshRenderClass();
	    }
	  } else {
	    log("IGNORING SOURCES.JS");
	  }
	}

	this.rebuildUnlock();

        log("trying to get settingsLayout...");
	this.settingsLayout = this.getParentSpace().attributes().lib.layout["settings.html"]
        //log("got SETTINGS LAYOUT '" + this.settingsLayout + "'");

	if (!this.haveSaved)
	    this.setMode (this.MODE_EDIT);

	this.manageElement(this.element);

	// Hidden until mouseover XXX: take edit/haveSaved into account?  seems to work as is....
	if (this.posRange)
          this.element.addClass('FisheyeHidden');

	FisheyeConsole.registerShift(this);
    },



    /*
	 Functions to fill and refresh parts of GUI
    */

    fillSubmitter: function(that) {
	// Submitter
	this.submitterBox = new ShiftSpace.Element('div', {
		'class' : 'FisheyeDisplayItem',
	});
        this.submitterBox.appendText(this.getText('submitter') + ": " + this.getAuthorName());
	if (this.canIgnore()) {
	  this.submitterIgnore= new ShiftSpace.Element('div', {
		  'class' : 'FisheyeInlineActiveText',
	  });
	  this.submitterIgnore.appendText("[" + this.getText('ignore') + "]");
	  this.submitterIgnore.addEvent('click', function(){
	      this.settings.hiddenAuthors[this.shiftAuthor()] = true;
	      this.settings.hiddenAuthorNames[this.shiftAuthor()] = this.getAuthorName();
	      this.saveSettings();
	      this.rebuild();
	  }.bind (that));
	  this.submitterIgnore.injectInside(this.submitterBox);
	}
        this.submitterBox.injectInside(this.detailsBox);
    },

    refreshStyle: function(target) {
        target.setStyles({
            'font': '16px verdana, sans-serif',
	    'font-weight': 'bold',
            'padding':  '2px 2px 2px 2px',
            'color': '#FFF',
	    'background-color': this.criticismCategoryGetColor(this.categoryType),
        });
    },

    // Call this after setting category to update render func
    refreshRenderClass: function() {
	if (this.criticismCategories[this.categoryType] &&
	    this.criticismCategories[this.categoryType].renderClass)
	  return this.criticismCategories[this.categoryType].renderClass;
	return FisheyeDefaultRenderClass;
    },

    shouldIgnoreShift: function() {
	if (this.settings.hiddenAuthors[this.shiftAuthor()]) {
	    log("HIDING because shiftAuthor is in hidden list");
	    return true;
	} else {
	    log("NOT HIDING because shiftAuthor is not in hidden list");
	    return false;
	}
    },

    // Fills the main element with all the GUI content
    fillElement: function(container) {

	if (this.rebuildLockCount > 0)
	    return;

	// XXX: replace with hide/show so it doesn't leave dots
	// XXX: don't filter 'unknown' ???
	// XXX: be careful to allow creation of new shifts (don't filter before save)
/* 
	if ((this.settings.hiddenCategories[this.categoryType] && this.mode == this.MODE_DISPLAY))
	    || this.settings.hiddenSources[this.sourceCode]) 
	    return;
*/
	// XXX: deprecate
	if (this.shouldIgnoreShift())
	    return;

	this.refreshStyle(this.element);

	// Render icon into top of element
        //this.handleBar = new ShiftSpace.Element ('div', {'class':'FisheyeHandleBar'});
	//this.handleBar.appendText('yomama');
        this.handleBar = new ShiftSpace.Element ('div');
        this.handleBar.injectInside(this.element);
	this.renderClass.renderIcon(this, this.handleBar);

	// Display and edit modes are rendered in parallel,
	// relying on renderClass so that plugins (eg NewsTrust)
	// can accept and display special data
	if (this.mode == this.MODE_DISPLAY || this.mode == this.MODE_EDIT) {
	    var isEdit = (this.mode == this.MODE_EDIT) ? true : false;
	    var de = isEdit ? this.editBox : this.detailsBox;

	    if (isEdit) {
		this.editBox = makeNoteBox(container);
		this.editBox.setStyles({ width : 300, });
		var de = this.editBox;
		de.appendText(this.getText('editLink'));
		this.renderClass.renderLinkBox(this, isEdit, de);
	        new ShiftSpace.Element ('div', {'class':'FisheyeSpacer'}).injectInside(de);
		de.appendText(this.getText('editType'));
		this.renderClass.renderCategory(this, isEdit, de);
	        new ShiftSpace.Element ('div', {'class':'FisheyeSpacer'}).injectInside(de);
	        de.appendText(this.getText('editSummary'));
		this.renderClass.renderSummary(this, isEdit, de);
	        new ShiftSpace.Element ('div', {'class':'FisheyeSpacer'}).injectInside(de);
		de.appendText(this.getText('editEmbed'));
		new ShiftSpace.Element('br').injectInside(de);
		makeButton(this.getText('lockPos'), de, this.modes[this.mode].onRange.bind(this));
	        new ShiftSpace.Element ('div', {'class':'FisheyeSpacer'}).injectInside(de);
	    } else {
		this.detailsBox = makeNoteBox(container);
		if (this.mode != this.MODE_DISPLAY || !this.shown)
		    this.detailsBox.addClass('FisheyeHidden');
		var de = this.detailsBox;
		this.renderClass.renderCategory(this, isEdit, de);
		this.renderClass.renderSummary(this, isEdit, de);
		this.renderClass.renderLinkBox(this, isEdit, de);
	    }

	    this.fillSubmitter(this);
	    if (!isEdit) {
		this.renderClass.renderSource(this, de);
	    }
	}

	// Other modes don't depend on renderClass, handle generic
	else {
	    this.modes[this.mode].fillBody(this, container);
	}

	// Button Box: DISPLAY mode gets buttons for each other mode,
	// other modes make their own buttons as needed
	if (this.mode == this.MODE_DISPLAY) {
	    this.buttonBox = makeDisplayItem();
	    for (var key in this.modes) {
		if (key == this.MODE_DISPLAY) {}
		else if (key == this.MODE_EDIT && !this.myCanEdit()) {} 
		else {
		  var eb = makeButton(this.modeGetName(key), this.buttonBox);
		  eb.addEvent('click', this.setMode.bind(this, key));
		}
	    }
	    this.buttonBox.injectInside( this.detailsBox );
	} else {
	    this.modes[this.mode].makeButtons(this);
	}
    },

	// XXX: temp debug wrapper, remove
    myCanEdit: function() {
	log( "myCanEdit: this.shiftAuthor() " + this.shiftAuthor() + " this.getUserId() " + this.getUserId() + " this.canEdit() " + this.canEdit());
	return this.canEdit();
    },

    //canEdit: function() {
	//// XXX: restore
	//return true;
	//log("canEdit this.getUserName " + this.getUserName() + " shiftAuthor " + this.shiftAuthor());
	//return loggedIn() && (this.getUserName() == this.shiftAuthor());
    //},

    // Don't allow the user to ignore themself
    canIgnore: function() {
	// TODO: doesn't work.  dump both.
	log( "CAN_IGNORE shiftAuthor " + this.shiftAuthor() + " getUserId " + this.getUserId());
	return (this.shiftAuthor() != this.getUserId());
    },

    loggedIn : function() {
	return ShiftSpace.User.isLoggedIn();
    },

    shiftAuthor : function() {
      // XXX: getAuthor() doesn't work anymore?  'undefined' displayed in GUI
      return this.getAuthor();
    },

    // currently this is just used to hide settings as it seems
    // settings aren't saved in proxy mode XXX: true
    // XXX: isProxy will no longer work
    isProxy : function() {
	return false;
    },

    getUserName : function() {
        return ShiftSpace.User.getUserName();
    },


    toggleHiddencategory: function(key) {
	if (this.settings.hiddenCategories[key])
	  this.settings.hiddenCategories[key] = false;
	else
	  this.settings.hiddenCategories[key] = true;

	this.rebuild();
    },

    fillCriticismCategories: function(container) {
	for (var key in this.criticismCategories) {
	    var label = this.settings.hiddenCategories[key] ?  " [_] " : " [X] ";
	    label += this.criticismCategoryGetName(key);
	    var someBox = makeTextBox(container, label);
	    someBox.addEvent('click', function(e, key){
		this.toggleHiddencategory(key);
	    }.bindWithEvent(this, key));
	}
    },

    fillIgnoredSources: function(container) {
	var hadIgnoredSource = false;
	for (var key in this.settings.hiddenSources) {
	    if (this.settings.hiddenSources[key]) {
		var label = this.criticismSourceGetName(key);
		var someBox = makeTextBox(container, label);
		someBox.addEvent('click', function(key){
		    this.settings.hiddenSources[key] = false;  // show source
		    this.rebuild();
		}.bind (this, key));
		hadIgnoredSource = true;
	    }
	}
	if (!hadIgnoredSource)
	    makeTextBox (container, "  " + this.getText('settingsNoneIgnored') + "  ");
    },

    fillIgnoredAuthors: function(container) {
	var hadIgnoredUser = false;
	for (var key in this.settings.hiddenAuthors) {
	    if (this.settings.hiddenAuthors[key]) {
	        label = this.settings.hiddenAuthorNames[key]
		var someBox = makeTextBox (container, label);
		someBox.addEvent('click', function(key){
		    this.settings.hiddenAuthors[key] = false;  // show source
		    // Note: don't bother cleaning up authorNames
		    this.rebuild();
		}.bind (this, key));
		hadIgnoredUser = true;
	    }
	}
	if (!hadIgnoredUser)
	    makeTextBox (container, "  " + this.getText('settingsNoneIgnored') + "  ");
    },

    fillLanguages: function(container) {
        languages = FisheyeTranslation.getLanguageTable();
	for (var key in languages) {
		var someBox = makeTextBox (container, languages[key].languageName);
		someBox.addEvent('click', function(key){
		    this.settings.language = key;
		    this.rebuild();
		}.bind (this, key));
	}
    },


    /*
	 Build the interface
    */
    
    build: function(json) {
        if (!this.haveSaved) {
          var x = window.getScroll().x + (window.getWidth() - 300) / 2; // XXX: hardcoded width!
          //var y = window.getScroll().y + (window.getHeight() - this.defaults.size.y) / 2
          var y = 0;

          json.position = { x : x, y : y} // TODO: center?  right edge? etc
	}

	// Our toplevel container
        this.element = new ShiftSpace.Element('div');

	// initialize height
	this.element.style.zIndex=1;



	if (json.posRef) {
	    this.posRef = json.posRef;
	    log("loaded posRef:");
	    //this.dumpObj (this.posRef);
	    this.posRange = ShiftSpace.RangeCoder.toRange (json.posRef);
	} else {
	    log("setting this.element position to " + json.position.x + "," + json.position.y);
	    setElementPosition(this.element, this.json.position.x, this.json.position.y);
	}

	log("calling renderRange from line 808");
	this.renderRange(this.posRange);

	this.fillElement(this.element);

	// Add our shift to page
        this.element.injectInside(document.body);

	// set up the mouse enter/leave events for hiding and reveal details
	// TODO: mouseenter/leave trigger "this.hasChild not a function" error... arg order?
	this.element.addEvent('mouseover', this.onMouseIn.bind(this));
	this.element.addEvent('mouseout', this.onMouseOut.bind(this));
    },

    rebuildLockCount : 0,

    rebuildLock: function() {
	this.rebuildLockCount++;
    },

    rebuildUnlock: function() {
	this.rebuildLockCount--;
	if (this.rebuildLockCount <= 0)
	    this.rebuild();
    },

    rebuild: function() {
	if (this.rebuildLockCount > 0)
	    return;
    	this.wrapSetHTML(this.element, "");
	this.fillElement(this.element);
	this.wrapSetHTML(this.anchoredIcon, "");
	this.renderClass.renderIcon(this, this.anchoredIcon);
    },

    // After calling save(), ShiftSpace engine will call back our encode()
    // Any data which needs to persist should be written to json array and
    // returned
    encode: function() {
	var pos = this.element.getPosition();

	if (this.inputArea)
	    this.summaryText = this.inputArea.value;

	this.json = {
	    summaryText : this.summaryText,
	    haveSaved 	: this.haveSaved,
	    categoryType : this.categoryType,
	    sourceCode 	: this.sourceCode,
	    criticismLink : this.criticismLink,
	    position 	: pos,
	    posRef 	: this.posRef,
	       // What gets displayed in shift list
	    summary 	: this.renderClass.getDisplaySummary(this),
	};

	return this.json;
    },


    saveSettings: function() {
	this.getParentSpace().setPreference('settings', this.settings);
    },

    gotSettings: function(settings) {
	this.settings = settings;
	if (!this.settings.hiddenCategories)
	    this.settings.hiddenCategories = {};
	if (!this.settings.hiddenSources)
	    this.settings.hiddenSources = {};
	if (!this.settings.hiddenAuthors)
	    this.settings.hiddenAuthors = {};
	if (!this.settings.hiddenAuthorNames)
	    this.settings.hiddenAuthorNames = {};
	this.continueInitialize();
    },

    loadSettings: function() {
          this.getParentSpace().getPreference('settings', {}, this.gotSettings.bind(this)); 
    },

    setCategory: function(idx) {
	this.categoryType = idx;
	this.renderClass = this.refreshRenderClass();
	this.summaryText = this.inputArea.value; // XXX: edit merge: was this removed?
	this.rebuild();
	FisheyeConsole.updateConsole(this);
    },

    maybeTypeFromLink: function(link) {
	// Clean up link  TODO: strip leading whitespace
	if (link.indexOf("http://") == 0) {
	  log("string starts with http://");
	  link = link.substring(7);
	}
	for (var key in this.criticismCategories) {
	  var cat = this.criticismCategories[key];
	  var host = cat.host;
	  log("checking link " + link + " against key " + key + " host " + host);
	  //this.dumpObj(this.criticismCategories[key]);
	  if (link.indexOf(host) == 0) {
	    this.setCategory(key);
	  }
	}
    },

    changeCriticismLink: function() {
	var msg = prompt(this.renderClass.changeLinkPrompt, this.criticismLink);
	if (msg) {
	    this.criticismLink = msg;
	    this.sourceCode = this.criticismSourceFromLink(msg);
	    this.maybeTypeFromLink(msg);
	    //this.summaryText = this.inputArea.value; // XXX: editmerge: was this removed?
	    this.rebuild();
	}
    },

    setMode : function(newMode) {
	if (this.mode == newMode) return;

	if (newMode == this.MODE_EDIT && !this.loggedIn()) {
          //ShiftSpace.Console.show();
          //ShiftSpace.Console.showTab('login');
          alert('Sorry, you must be signed in to edit shifts.');
	  return;
        }

	if (newMode == this.MODE_EDIT && !this.myCanEdit()) {
	// XXX: in a perfect world this case would never occur
          alert('SoRRY, you cannot edit shift created by user ' + this.getAuthorName());
	  return;
        }

	this.mode = newMode;
	this.rebuild();
	if (this.mode == this.MODE_EDIT) {
	    this.anchoredIcon.addClass('FisheyeHidden');
	    this.element.makeDraggable({handle: this.handleBar});
	}
    },


	// TODO: mootools has an event which doesn't fire on subelements...
	// we could use that, although we'd likely keep the timer logic
    onMouseIn : function( e )
    {
        //log("onMouseIn");
	// we don't want the event to continue
	var evt = new Event(e);
	evt.stopPropagation();

	// Cancel any pending hide, then show
	this.hidePending = 0;

	if (this.shown) {
	  //log("onMouseIn returning because this.shown");
	  return;
        }

	// If user is mousing over placeholder (which might have changed
	// since shift creation, eg if user changes font size) then
        // make sure position matches embedded icon
        this.updatePosition();

	// Raise this Shift a little bit so it draws over the minimized icons
	this.element.style.zIndex=2;
	this.shown = true;

	// DISPLAY is the only mode that minimizes...
	if (this.mode == this.MODE_DISPLAY) {
	    this.detailsBox.removeClass('FisheyeHidden');
	    this.buttonBox.removeClass ('FisheyeHidden');
		// XXX: haveSaved etc?
	    if (this.posRange)
	        this.element.removeClass ('FisheyeHidden');
	}
    },
    
    onMouseOut : function( e )
    {
      //log("onMouseOut");
      // we don't want the even to continue
      var evt = new Event(e);
      evt.stopPropagation();

      this.hidePending = 1;

      (function(){ 
	  if (this.hidePending) {    // Unless hide was cancelled...
	      this.hidePending = 0;
	      if (this.mode != this.MODE_DISPLAY)  // Only minimize display mode
		  return;
	      this.detailsBox.addClass('FisheyeHidden');
	      this.buttonBox.addClass('FisheyeHidden');
	      if (this.posRange)
	          this.element.addClass('FisheyeHidden');
	      this.element.style.zIndex=1;  // Lower to default height
	      this.shown = false;
	  } 
      }.bind(this) ).delay(500);
    },

    // XXX - might want to implement show (must call this.parent())
    // to better handle multiple toplevel elements

    /*
      Function : finishFrame
	Finishing building the iframe by including the textarea inside.
	TODO: this was taken from NOTES, unclear why this is not done inline...
	assume because it needs to be linked into document for below to work
    */
    finishFrame : function()
    {
	// Get document reference and MooToolize the body
	var doc = this.summaryFrame.contentDocument;
	this.frameBody = $(doc.body);
	this.frameBody.setProperty('id', 'FisheyeNoteShiftFrameBody');

	// create the text area
	this.inputArea = $(doc.createElement('textarea'));
	this.inputArea.setProperty('class', 'FisheyeNoteShiftTextArea');
	this.inputArea.injectInside( this.frameBody );
	this.inputArea.setProperty('value', this.summaryText);
	this.inputArea.focus();
	
	this.inputArea.addEvent('mousedown', function() {
	   this.fireEvent('onFocus', this);
	}.bind(this));
    },

    buildInputArea : function()
    {
	this.inputArea = new ShiftSpace.Element('textarea', {
	    'class' : 'FisheyeNoteShiftTextAreaSimple',
	    'rows' : 8,
	    'value' : this.summaryText
	});
	this.inputArea.focus(); // XXX: necessary?  harmful?
	this.inputArea.addEvent('mousedown', function() {
	   this.fireEvent('onFocus', this);
	}.bind(this));
    },

    getWebPage: function(url, callback, onerror) {
	log("getWebPage with url '" + url + "'");
	if (!onerror)
	  onerror = function() {};
        this.xmlhttpRequest({
            'method': 'GET',
            'url': url,
            'onload': callback,
	    'onerror': onerror
        });
    },



/*

PLATFORM HOOKS

*/

      // Called by platform when a particular annotation is created or loaded
    setup: function(json) {
        log("FISHEYE setup called with json: ");
	this.dumpObj(json);

	// Initalize global stuff and load miscellaneous code
        globalLibsHandle = this.getParentSpace().attributes().lib;
        globalInit();

	// Store initialize data in case we want to reload
	this.json = json;

	// We have to load user preferences before we can load shift
	this.loadSettings();
    },

      // Called by platform when a shift is deleted
    destroy: function() {
      this.parent();
      this.anchoredIcon.dispose();
    },


      // Called by platform when a shift is shown
    show: function() {
      log("SHIFT CLASS SHOW CALLED");
      this.element.removeClass('FisheyeHidden');
      this.anchoredIcon.removeClass('FisheyeHidden');
      if (this.posRange) {
	      this.anchoredIcon.style.display = "inline";
      }
      this.parent();
    },

      // Called by platform to hide a shift
    hide: function() {
      log("SHIFT CLASS HIDE CALLED");
      this.element.addClass('FisheyeHidden');
      this.anchoredIcon.addClass('FisheyeHidden');
      if (this.posRange) {
	      this.anchoredIcon.style.display = "none";
      }
      // TODO: get current dimensions; save; set dimensions to 0,0
      this.parent();
    },

       // Called by platform when the number of Fisheye shifts shown goes from 0 to 1
    showInterface: function() {
      log("SHOW INTERFACE");
    },

      // Called by platform when the number of Fisheye shifts shown goes from 1 to 0
    hideInterface: function() {
      log("HIDE INTERFACE");
    },

      // Called by platform when user initiates edit via console
    edit: function()
    {
      this.parent();
      this.showEditInterface();
    },

      // Called by platform when user initiates save via console
    leaveEdit: function()
    {
      this.parent();
      this.modes[this.mode].onSave().bind(this);
    },

});


// Global function for debug logging
var log = function(msg) {
	if (typeof console == 'object' && console.log) {
		console.log(msg);
	} else if (typeof GM_log != 'undefined') {
		GM_log(msg);
	}
    };

var setElementPosition = function(element, x, y) {
    element.setStyles({
      'position': 'absolute',
      left : x,
      top : y,
    });
};




var FisheyeTranslation = null;

var globalInit = function() {
  translationCode = globalLibsHandle.code["translation.js"];
  eval(translationCode);
  FisheyeTranslation = myFisheyeTranslation;
};




var FisheyeConsoleClass = new Class({

    registeredShifts: [],

    registerShift: function(shift) {

	this.registeredShifts[this.registeredShifts.length] = shift;

	if (this.registeredShifts.length == 1)
	    this.makeConsole(shift);
	else
	    this.updateConsole(shift);
    },

    updateConsole: function(shift) {
	var byType = {};
	var byTypeCount = {};

       var totalVisibleCount = 0;

	for (var i=0; i < this.registeredShifts.length; i++) {
		var ashift = this.registeredShifts[i];
		if (ashift.haveSaved) {
		        totalVisibleCount++;
			byType[ashift.categoryType] = ashift;
			if (byTypeCount[ashift.categoryType])
				byTypeCount[ashift.categoryType]++;
			else
				byTypeCount[ashift.categoryType] = 1;
		}
	}

	if (totalVisibleCount < 1)
	  return;

	var container = this.consoleElement;
	var dynamicLayout = false;
	if (dynamicLayout) {
	  wrapSetHTML(container, this.consoleLayout);
	  shift.preProcessLayout(container);
	}
	else {
	  container.setStyles({
	      'font': '16px verdana, sans-serif',
	      border : 'medium double #C4C87C' ,
	  });
	  wrapSetHTML(container, "");

	  var summaryBox = makeNoteBox(container);
	  var content = "Fisheye summary:";
	  summaryBox.setStyles({ 'font': '16px verdana, sans-serif', });
	  wrapSetHTML(summaryBox, content);
	  summaryBox.injectInside(container);
	}

	var sortedTypes = new Array();
	for (var key in byType) {
	    sortedTypes.push(key);
	}
	sortedTypes = sortedTypes.sort();
	
	for (var i=0; i < sortedTypes.length; i++) {
		var key = sortedTypes[i];
		var shiftBox = new ShiftSpace.Element('div');
		var ashift = byType[key];
		var cat = ashift.criticismCategoryGetName(ashift.categoryType);
		shiftBox.appendText(byTypeCount[key] + " " + cat);
		ashift.refreshStyle(shiftBox);
		shiftBox.injectInside(container);
	}
    },

    makeConsole: function(shift) {
	this.consoleLayout = shift.getParentSpace().attributes().lib.layout["console.html"]

        this.consoleElement = new ShiftSpace.Element('div');

	this.consoleElement.addEvent('click', function(){
	    this.consoleElement.addClass('FisheyeHidden');
	}.bind (this));

	this.consoleElement.setStyles({
	  'position': 'absolute',
	  left : 0,
	  top : 0,
	  zIndex : 2
	});
	this.updateConsole(shift);
        this.consoleElement.injectInside(document.body);
    },

});

var FisheyeConsole = new FisheyeConsoleClass();




// REFERENCE BELOW

/*           var xmlobject = http_request.responseXML;
	     var root = xmlobject.getElementsByTagName('rss')[0];
	     var channels = root.getElementsByTagName("channel");
	     var items = channels[0].getElementsByTagName("item");
	     var descriptions = items[0].getElementsByTagName("description");
	     var date = items[0].getElementsByTagName("pubDate");
*/

	/* some GET formatting code that might come in handy
        var url = server + 'shiftspace.php?method=' + method;
        for (var key in parameters) {
            url += '&' + key + '=' + encodeURIComponent(parameters[key]);
        }
        url += '&v=' + version;
        loadFile(url, callback);    
	*/

/*      var rightclick = false;
	if (!e) var e = window.event;
	if (e.which) rightclick = (e.which == 3);
	else if (e.button) rightclick = (e.button == 2);
	log('Rightclick: ' + rightclick); // true or false
*/


/*
TODO: allow edit ONLY IF YOU OWN IT

rename variables
replace members variables with local vars in fill/build funcs
disable save button until fields have been set
decorate URI field red until it has been set (others?)
initialize zIndex (done but doesn't seem to work)
don't overload criticismLink for newsTrust?
make undraggable when exiting edit mode
cancel should undo any unsaved position change
ref by range as well as position, plus text.  allow for smart decision later
finish cleanup of render funcs: isEdit, target
signup/login placeholder logic?
plugin settings gui hooks?
generic per-shift and per-user data storage hooks for plugins?
edit/setup icons in header? buttonbar?
gui layout in separate HTML file

in general, having both embedded icon and full flying interface is wierd
  - after relocting a shift not tied to text, placeholder still at old pos
  - embedded icon doesn't change color or style after changing type


how to show space settings without having a shift?
  example: there is one shift on page, author is in ignore list, impossible to edit ignore list

F is bold/not bold or different font between placeholder / opened (at least when in edit mode).  is this only possible when anchor and shift are at different places?

mouse out events from link rollover cause shift hide (hard to hit edit button) -> this seems to actually be a bug with the SS console, not with fisheye (even when console is closed, resize handle at top edge still grabs focus on mouseover)

put new shift z position to be console +1 ???  every new shift ends up underneath the console

change position of shift by dragging or locking to new text: anchored icon stays at old position until page is reloaded.
on shift save, (maybe) update x,y position of anchored icon - need to handle the case that posRange has been updated!

edit -> drag -> cancel -> anchoredIcon visible at dragged location until mouse in/out

why are we always checking if(anchoredIcon) ?? doesn't it always exist?

why is updatePosition called every time shift is hidden (to placeholder... mouse in/out to observe)

test: anchor locked to text, change font size: does it follow anchored icon?  might make more sense to actually hide element rather than hiding everything-except-icon on mouseout: then every time it was shown, could be shown at anchor position

settings -> change language -> cancel -> doesn't restore previous settings

language list should be a drop-down list

space -> settings -> cancel -> console space count increases to 2

sources plugin loading is an unrecommended use of eval; remove the assignment from the end of each plugin, and end with a hash table (not assigned to variable)

*/


// XXX: ignore list: store original user name

// to start server:

// sudo /opt/local/bin/couchdb 
// cd ~/Sites/shiftspace; python shifty.py runserver
