

var displayTextEnglish = {
	    languageKey : "en",
	    languageName : "English",
	    source : "source",
	    submitter : "submitter",
	    settings : "settings for",
	    settingsCat : "Which categories are shown",
	    settingsIgnoredSources : "Ignored sources",
	    settingsIgnoredAuthors : "Ignored authors",
	    settingsNoneIgnored : "none ignored",
	    clickToRestore : "(click to restore)",
	    ignore : "ignore this ",
	    read : "Read",
	    rangeWarning : "You need to select some page content first!",
	    save : "Save",
	    cancel : "Cancel",
	    done : "Done",
	    lockPos : "Embed after selected text",
	    defaultText : "This claim is false because...",
	    language : "Language",
	    editLink : 'Set link to source supporting your comment:',
	    editType : 'Make sure type is set correctly:',
	    editSummary : 'Summarize the criticism here:',
	    editEmbed : 'Embed into text: select some text and press the button below.  Shift will be set to embed after the selected text.',
};

var FisheyeTranslationClass = new Class({

    haveLoadedLanguages : false,

    displayLanguages : {
	    'en' : displayTextEnglish,
    },

    loadLanguages: function() {
	if (this.haveLoadedLanguages)
          return;

	languages = globalLibsHandle.lang
        //log("LANGUAGES:");
        //this.dumpObj(languages);
	for (var key in languages) {
	  log("LANGUAGE " + key);
	  //log("" + key + " : " + someObj[key]);
	  if (key != "languages.js") { // XXX: file is deprecated, remove
	    thisLang = eval(languages[key]);
		// TODO: stronger validation of languages
	    if (thisLang.languageKey === undefined) {
	      log ("BAD LANGUAGE " + key);
	      log ("BAD LANGUAGE " + key);
	      log ("BAD LANGUAGE " + key);
	    } else {
	      this.displayLanguages[thisLang.languageKey] = thisLang;
	      log ("added language " + thisLang.languageKey);
	    }
	  } else {
	    log ("IGNORING LANGUAGES.JS");
	  }
	}

        this.haveLoadedLanguages = true;
    },

    getLanguageTable: function() {
	this.loadLanguages();
        return this.displayLanguages;
    },

    getModeName: function(key, language) {
	this.loadLanguages();

	if (this.displayLanguages[language] &&
	    this.displayLanguages[language].modes &&
	    this.displayLanguages[language].modes[key])
	    return this.displayLanguages[language].modes[key];
        return null;
    },

    getCriticismCategoryName: function(idx, language) {
	this.loadLanguages();

	if (this.displayLanguages[language] &&
	    this.displayLanguages[language].criticismCategories &&
	    this.displayLanguages[language].criticismCategories[idx])
	  return this.displayLanguages[language].criticismCategories[idx];
	return null;
    },

    // Get text for display, current language if possible or default to English
    getText: function(word, language) {
	this.loadLanguages();

	if (this.displayLanguages[language] &&
	    this.displayLanguages[language][word])
	  return this.displayLanguages[language][word];
        log("MISSING TRANSLATION for language " + language + " key " + word);
	return displayTextEnglish[word];
    },

});

var myFisheyeTranslation = new FisheyeTranslationClass();
