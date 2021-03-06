
var CutupsSpace = ShiftSpace.Space.extend({
  attributes: {
    name: 'Cutups',
    icon: 'Cutups.png', 
    version: 0.2,
    css: 'spaces/Cutups/Cutups.css'
  },
  
  setup: function(){
    //window.visibleShifts = this.visibleShifts;
  },
  
  visibleShifts: [],  //contains object meta of shifts currently show on page i.e. { commonAncestorNode : <p>, sscutupid : 12-12-343-34234902 }
  
  removeFromVisibleShifts: function(sscutupid){
    // console.log("==================================removeFromVisibleShifts");
    for(var i=0; i < this.visibleShifts.length; i++){
      if(this.visibleShifts[i].sscutupid = sscutupid){
        delete this.visibleShifts[i];
      }
    }
    var cleanedShiftArray = this.visibleShifts.filter(function(item,index){
      return $chk(item);
    });
    this.visibleShifts = cleanedShiftArray;
  },
  
  getRangeAncestorNode: function(refObj)
  {
    // console.log('getRangeAncestorNode');
    var returnAncestor;
    var colAncestorPosition   = refObj.ancestorPosition;
    
    //get all the elements with the ancestor tagname
    var nl                    = document.getElementsByTagName(colAncestorPosition.tagName);
    var iIndex                = colAncestorPosition.ancIndex;
    var iOccuranceLength      = 0;
    var targetTextContent     = refObj.ancestorOrigTextContent;

    // console.log('blar');
    //check if the tag Name is the body then compare differently
    if (colAncestorPosition.tagName.toLowerCase() == "body")
    {
      //return (targetTextContent==ShiftSpace.orig_text_content)?document.getElementsByTagName('body')[0]:null;
      return document.body;
    }
    else
    {
      //check the number of occurances of the similar nodes
      // console.log('checking similar nodes ' + nl.length);
      for (var i=0;i<nl.length;i++)
      {
        //console.log(i);
        if(nl.item(i).textContent==targetTextContent)
        {
          iOccuranceLength++;
          //if this is the occurance index mark the node as the ancestor node
          if (iIndex==iOccuranceLength)
          returnAncestor = nl.item(i);
        }
      }
      // console.log('exit loop');
    }
    
    //validate that the page has the same number of occurances to make sure we highlight the right one
    if (iOccuranceLength == colAncestorPosition.length)
    {
      return returnAncestor;          
    }
    else
    {
      return null;
    }
  },  
  
  addToVisibleShifts: function(shift){
    // console.log("===================================================addToVisibleShifts");
    var commonAncestor = this.getRangeAncestorNode(shift.range);
    
    var visibleShiftMeta = {
      sscutupid: shift.sscutupid,
      commonAncestor: commonAncestor
    }
    
    this.visibleShifts.push(visibleShiftMeta);
  },
  
  canShowShift: function(json){
    /*console.log("==================================================canShowShift json");*/
    if($chk(json.range)){
      var thisCommonAncestor = this.getRangeAncestorNode(json.range);
      
      for(var i=0; i<this.visibleShifts.length; i++){
        var thatCommonAncestor = this.visibleShifts[i].commonAncestor;
        
        if(thisCommonAncestor == thatCommonAncestor){
            alert("You are attempting to create a new Cutup that confilicts with " +
              "one currently being viewed on the page. Try hiding some of the currently displayed Cutups.");           
            return false;
        }
        
        var thisCommonAncestorElements =  $(thisCommonAncestor).getElements("*");
        var thatCommonAncestorElements =  $(thisCommonAncestor).getElements("*");
        
        for (var i=0; i<thisCommonAncestorElements.length; i++){
          for(var x=0; x<thatCommonAncestorElements.length; x++){
            if(thatCommonAncestorElements[x] == thisCommonAncestorElements[i]){
              alert("You are attempting to create a new Cutup that confilicts with " +
                "one currently being viewed on the page. Try hiding some of the currently displayed Cutups.");            
              return false;
            }
          }
        }
        for (var i=0; i<thatCommonAncestorElements.length; i++){
          for(var x=0; x<thisCommonAncestorElements.length; x++){
            if(thatCommonAncestorElements[i] == thisCommonAncestorElements[x]){
              alert("You are attempting to create a new Cutup that confilicts with " +
                "one currently being viewed on the page. Try hiding some of the currently displayed Cutups.");            
              return false;
            }
          }
        }
      }
    }
    return true;
  },
  
  wordPattern: new RegExp("(\\S+(\\s?)+){1,1}","g"), //default chunk is one 'word'
  
  buildUI: function(){
    var SSCutupWidget = new ShiftSpace.Element('div',{
      'id':'SSCutupWidget'});
    
    var SSCutupHandle = new ShiftSpace.Element('span',{
      'id':'SSCutupHandle'});
    
    var SSCutupTitleLabel = new ShiftSpace.Element('label',{
      'for':'SSCutupTitle'}).appendText('title:');
    
    var SSCutupTitle = new ShiftSpace.Element('input',{
      'id':'SSCutupTitle'
    });
    
    var SSCutupControls = new ShiftSpace.Element('div',{
      'id':'SSCutupControls'});
    
    var SSCutupChunkLabel = new ShiftSpace.Element('span',{
    'id':'SSCutupChunkLabel'});
    
    var SSCutupButtonSmaller = new ShiftSpace.Element('span',{
      'id':'SSCutupButtonSmaller'});
    
    var SSCutupButtonLarger = new ShiftSpace.Element('span',{
      'id':'SSCutupButtonLarger'});
    
    var SSCutupChunkAmount = new ShiftSpace.Element('span',{
      'id':'SSCutupChunkAmount'
    }).appendText("1");
    
    var SSCutupButtonCutup = new ShiftSpace.Element('span',{
      'id':'SSCutupButtonCutup'});
    
    var SSCutupButtonCancel = new ShiftSpace.Element('span',{
      'id':'SSCutupButtonCancel'});
    
    var SSCutupButtonSave = new ShiftSpace.Element('span',{
      'id':'SSCutupButtonSave'});
    
    var SSCutupButtonClose = new ShiftSpace.Element('span',{
      'id':'SSCutupButtonClose'});
    
    SSCutupControls.appendChild(SSCutupChunkLabel);
    SSCutupControls.appendChild(SSCutupButtonSmaller);
    SSCutupControls.appendChild(SSCutupChunkAmount);
    SSCutupControls.appendChild(SSCutupButtonLarger);
    SSCutupControls.appendChild(SSCutupButtonCutup);
    SSCutupControls.appendChild(SSCutupButtonCancel);
    SSCutupControls.appendChild(SSCutupButtonSave);
    SSCutupControls.appendChild(SSCutupButtonClose);
    
    SSCutupWidget.appendChild(SSCutupHandle);
    SSCutupWidget.appendChild(SSCutupTitleLabel);
    SSCutupWidget.appendChild(SSCutupTitle);
    SSCutupWidget.appendChild(SSCutupControls);
    
    SSCutupWidget.injectInside(document.body);
    
    SSCutupWidget.makeDraggable({'handle':SSCutupHandle});
    
    this.SSCutupWidget = SSCutupWidget;
    this.SSCutupTitle = SSCutupTitle;
    this.SSCutupChunkLabel = SSCutupChunkLabel;
    this.SSCutupButtonSmaller = SSCutupButtonSmaller;
    this.SSCutupButtonLarger = SSCutupButtonLarger;
    this.SSCutupChunkAmount = SSCutupChunkAmount;
    this.SSCutupButtonCutup = SSCutupButtonCutup;
    this.SSCutupButtonCancel = SSCutupButtonCancel;
    this.SSCutupButtonSave = SSCutupButtonSave;
    this.SSCutupButtonClose = SSCutupButtonClose;
    
    this.UIBuilt = true;
    
  },
  
  showInterface: function(){
    this.parent();
    if(this.UIBuilt == true){
      $("SSCutupWidget").removeClass('SSDisplayNone');
      $("SSCutupWidget").removeClass('SSHidden');
    }
  },
  
  hideInterface: function(){

  }
  
});

var CutupsShift = ShiftSpace.Shift.extend({
    setup: function(json){
      var space = this.getParentSpace();
      
      if(this.isNewShift() == false){ //if this is a previously created shift
        
        this.sscutupid = json.sscutupid;
        this.range = json.range;
        
        if(json.range.origText){
          this.range.origText = this.deTokenizeNewline(json.range.origText);
        }
        
        this.cutupTextArray = json.cutupTextArray;
        this.origTextArray = json.origTextArray;
        this.joinedTextArray = json.joinedTextArray;
        this.sscutupid = json.sscutupid;
        
        this.cutupTextOnPage = false;
        
        if(json.range.ancestorOrigTextContent){
          this.range.ancestorOrigTextContent = this.deTokenizeNewline(json.range.ancestorOrigTextContent);
        }

      }else if(this.isNewShift() == true){ //if this shift has just been created
        if(space.UIBuilt != true){
          space.buildUI();
        }
        this.sscutupid = this.create_sscutupid();
        this.cutupTextOnPage = false; //if shift has cut text
        //a new shift
        //attaches events to widget
        //creates a range from a valid selection
        //creates cutup from range
        //inserts into document
        //on save detaches events events from widget
      }
    },
    
    tokenizeNewline: function(text){
      var tokenizedText = text.replace(new RegExp("\\n","g"),"__newline__");  
      return tokenizedText;
    },
    
    deTokenizeNewline: function(text){
      var deTokenizedText = text.replace(new RegExp("__newline__","g"),"\n");
      return deTokenizedText;
    },
    
    show: function() {
      // console.log("===================================================Shift show");
      var space = this.getParentSpace();
      if(this.isNewShift() == false){
        if(space.canShowShift(this) == false){
          return false;
        }
      }
      //showing a just created shift or a previously created and saved shift
      if(this.cutupTextOnPage == false){
        
        if (this.range) {
          if(space.canShowShift(this) == false){
            return false;
          }else{
            space.addToVisibleShifts(this);
          }
          //if origText exits clean it
          if(this.range.origText){
            this.range.origText = this.deTokenizeNewline(this.range.origText);
          }
          //if ancestorOrigTextContent exists clean it
          if(this.range.ancestorOrigTextContent){
            this.range.ancestorOrigTextContent = this.deTokenizeNewline(this.range.ancestorOrigTextContent);
          }
          this.turnOnRangeRef(this.range);
        }
        
      }
      if(this.isNewShift() == true){
        this.attachWidgetButtonEvents()
        
        //give UI feedback on active buttons
        space.SSCutupButtonCancel.addClass("inactive");
        space.SSCutupButtonSave.addClass("inactive");
        space.SSCutupButtonSmaller.removeClass("inactive");
        space.SSCutupButtonLarger.removeClass("inactive");
      }
      //scroll to cutup
      window.location.hash = this.getId();
      //FX for fading Cutup background-color alpha to transparent
      function fadeToTrans(){
        var trans = 1.0;
        function fade(){
          if(trans > 0.2){       
            trans = trans - 0.1;
            $$('span.SSCut').setStyle('outline','thin solid rgba(167,8,4,' + trans + ')');
            setTimeout(fade,50);
          }else{
            $$('.SSCut').setStyle('outline','');
          }
        }
        return fade();
      }
      fadeToTrans();
    },
    
    encode: function(){
      var space = this.getParentSpace();
      
      this.summary = space.SSCutupTitle.value;
      
      //remove title value after save and set button from re-cut to cutup
      space.SSCutupTitle.value = "";
      space.SSCutupButtonCutup.setStyle('background-position','center 0px');
      
      this.range.origText = this.tokenizeNewline(this.range.origText);
      
      if(this.range.ancestorOrigTextContent){
        this.range.ancestorOrigTextContent = this.tokenizeNewline(this.range.ancestorOrigTextContent);
      }
      //this.range.ancestorOrigTextContent = "REMOVED ANCESTOR ORIGINAL TEXT";
      return {
        sscutupid: this.sscutupid,
        range: this.range,
        cutupTextArray: this.cutupTextArray,
        origTextArray: this.origTextArray,
        joinedTextArray: this.joinedTextArray,
        summary: this.summary
      }
    },
    
    create_sscutupid: function(){
      var now = new Date();
      var month = now.getMonth() + 1;
      var day = now.getDate();
      var year = now.getFullYear();
      var hour = now.getHours();
      var min = now.getMinutes();
      var sec = now.getSeconds();
      var rand = $random(0,1000000);
      return (month + "-" + day + "-" + year + "-" + hour + "-" + min + "-" + sec + "-" + rand);
    },
    
    detachWidgetButtonEvents: function(){
      var space = this.getParentSpace();
      
      space.SSCutupButtonCutup.removeEvents("mousedown");
      space.SSCutupButtonSave.removeEvents("mousedown");
      space.SSCutupButtonCancel.removeEvents("mousedown");
      space.SSCutupButtonClose.removeEvents("mousedown");
      space.SSCutupButtonLarger.removeEvents("mousedown");
      space.SSCutupButtonSmaller.removeEvents("mousedown");
    },
    
    attachWidgetButtonEvents: function(){
      var space = this.getParentSpace();
      var self = this;
      space.SSCutupChunkAmount.setText("1");//reset chunk amount gui display to 1
      space.SSCutupButtonCutup.addEvent("mousedown",function(){
          self.fireCutup(); 
      });
      
      space.SSCutupButtonSave.addEvent("mousedown",function(){
          
          if(self.cutupTextOnPage == false){
            return false;
          }
          
          if(space.SSCutupTitle.value.match(/\S+/) == null){
            alert("You must give your Cutup a title before saving");
            return false;
          }
          
          self.detachWidgetButtonEvents();
          /*space.addToVisibleShifts(self);*/
          space.allocateNewShift();
          self.save();
      });
      
      space.SSCutupButtonCancel.addEvent("mousedown",function(){
          self.cancelCutup();
          space.SSCutupButtonCancel.addClass("inactive");
          space.SSCutupButtonSave.addClass("inactive");
          
          space.SSCutupButtonLarger.removeClass("inactive");
          space.SSCutupButtonSmaller.removeClass("inactive");
      });
      
      space.SSCutupButtonClose.addEvent("mousedown",function(){
         self.closeWidget();
         self.detachWidgetButtonEvents();
         space.SSCutupWidget.addClass("SSDisplayNone");
         space.SSCutupWidget.addClass("SSHidden");
      });
      
      space.SSCutupButtonLarger.addEvent("mousedown",function(){
          self.incrementChunkAmount();
      });
      
      space.SSCutupButtonSmaller.addEvent("mousedown",function(){
          self.decrementChunkAmount();
      });
      
    },
    
    incrementChunkAmount: function(){
      var space = this.getParentSpace();
      var self = this;
      var amount = parseInt(space.SSCutupChunkAmount.getText());
      
      if(self.cutupTextOnPage == true){
        alert("You cannot change the word chunk amount after a Cutup has been created.");
        return false;
      }
      
      if(amount < 20){
        amount = amount + 1;
        space.SSCutupChunkAmount.setText(amount);
      }else{
        amount = 1;
        space.SSCutupChunkAmount.setText(amount);
      }
      this.setWordChunkSize(amount);
    },    
    
    decrementChunkAmount: function(){
      var space = this.getParentSpace();
      var self = this;
      var amount = parseInt(space.SSCutupChunkAmount.getText());
      
      if(self.cutupTextOnPage == true){
        alert("You cannot change the word chunk amount after a Cutup has been created.");
        return false;
      }      
      
      if(amount > 1){
        amount = amount - 1;
        space.SSCutupChunkAmount.setText(amount);
      }else{
        amount = 20;
        space.SSCutupChunkAmount.setText(amount);
      }
      
      this.setWordChunkSize(amount);
    },
    
    cancelCutup: function(){
      var space = this.getParentSpace();
      //cancel is to be used during the creation of a shift nowhere else as will
      //cause ConFrusions
      if(this.cutupTextOnPage == false) return false;
      //ignores the specific shift since only one cutup can be on at a given moment 
      //search for all span elements with _shiftspace_cutup attribute and open them
      var xPathResult = document.evaluate(".//span[@sscutupid='" + this.sscutupid + "']", document, null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      
      var parentNodes = [];
      for (var i=0,l=0; i < xPathResult.snapshotLength; i++) {
          var spanElement = xPathResult.snapshotItem(i);
          //if is not an empty node grab content from json
          if(!xPathResult.snapshotItem(i).textContent.match(/^\s+$/) && this.isValidCutupTextNode(xPathResult.snapshotItem(i))){
            var newTextNode = document.createTextNode(this.origTextArray[l]);
            l++;
          }else{
            var newTextNode = document.createTextNode(spanElement.textContent);
          }
          parentNodes[i] = spanElement.parentNode;
          spanElement.parentNode.replaceChild(newTextNode, spanElement);
      } 

      for (var i = 0, l = xPathResult.snapshotLength; i < l; i++) {
          parentNodes[i].normalize();
      } 

      space.removeFromVisibleShifts(this.sscutupid);
      
      this.joinedTextArray = null;
      this.origTextArray = null;
      this.cutupTextArray = null;
      this.cutupTextOnPage = false;
      
      space.SSCutupButtonCutup.setStyle('background-position','center 0px');
        
    },
    
    closeWidget: function(){
      var self = this;
      var space = this.getParentSpace();
      self.cancelCutup();
    },

    hideCutups: function(json) {
        var xPathResult = document.evaluate(".//span[@sscutupid='" + json.sscutupid + "']", document, null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        
        var parentNodes = [];
        for (var i=0,l=0; i < xPathResult.snapshotLength; i++) {
          //if is not an empty node grab content from json
          var spanElement = xPathResult.snapshotItem(i);
          if(!xPathResult.snapshotItem(i).textContent.match(/^\s+$/) && this.isValidCutupTextNode(xPathResult.snapshotItem(i))){
            var newTextNode = document.createTextNode(json.range['origArray'][l]);
            l++;
          }else{
            var newTextNode = document.createTextNode(spanElement.textContent);
          }
          parentNodes[i] = spanElement.parentNode;
          spanElement.parentNode.replaceChild(newTextNode, spanElement);
        } 
  
        for (var i = 0, l = xPathResult.snapshotLength; i < l; i++) {
            parentNodes[i].normalize();
        } 
    },     
    
    hide: function(){
      // console.log("=================================================Shift hide");
      space = this.getParentSpace();
      var space = this.getParentSpace();
      
      this.hideCutups(this);
      this.cutupTextOnPage = false;
      space.removeFromVisibleShifts(this.sscutupid);
    },
    
    setWordChunkSize: function(numOfWords){
      var pattern = "(\\S+(\\s?)+){1," + numOfWords + "}";
      this.wordPattern = new RegExp(pattern,"g");
    },
    
    wordPattern: new RegExp("(\\S+(\\s?)+){1,1}","g"),
    
    fireCutup: function(){
      var space = this.getParentSpace();
      var self = this;
      //if selection exists and there is no an unsaved cutup on the page
      if (!window.getSelection().getRangeAt(0).collapsed && this.cutupTextOnPage == false) {
        
         var newRangeRef = ShiftSpace.RangeCoder.toRef(window.getSelection().getRangeAt(0));
         //if this newRangeRef conflicts with on currently show dont create
         
         this.range = newRangeRef;
         
         if(space.canShowShift(this) == false){
           return false;
         }  
         //this.tempCommonAncestor = space.getRangeAncestorNode(this)
         space.addToVisibleShifts(this);
         this.turnOnRangeRef(newRangeRef);
         
          //cutupTextArray contains text in selected range 'cutup'
          newRangeRef.cutupsArray = this.cutupTextArray;
          
          //origTextArray contains original text selected
          newRangeRef.origArray = this.origTextArray;
          
          //give UI feedback for re-cut
          space.SSCutupButtonCutup.setStyle('background-position','center -60px');
          
          this.cutupTextOnPage = true;
          
      }else if(this.cutupTextOnPage == true){
        //origTextArray exists so just re-cutup current cutup
          var xPathQuery = "//*[@sscutupid='"  + this.sscutupid + "']";
          var xPathResult = document.evaluate(xPathQuery, document.body, null,
              XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
          this.cutupRange(xPathResult);
      }else{
        return false;
      }
      
      //give UI feedback
      space.SSCutupButtonCancel.removeClass("inactive");
      space.SSCutupButtonSave.removeClass("inactive");
      space.SSCutupButtonLarger.addClass("inactive");
      space.SSCutupButtonSmaller.addClass("inactive");
      
      return false;
    },
    
    surroundTextNode: function(oNode, objRange, surroundingNode){
        var tempRange;
        //if this selection starts and ends in the same node
        if((oNode==objRange.startContainer)&&(oNode==objRange.endContainer)) {
            objRange.surroundContents(surroundingNode);
        }
        else
        {
            if(objRange.isPointInRange(oNode,1) || oNode==objRange.startContainer)
            {
                //check if the node is in the middle of the selection 
                if((oNode!=objRange.startContainer)&&(oNode!=objRange.endContainer))//surround the whole node
                {
                    surroundingNode.textContent = oNode.textContent;
                    oNode.parentNode.replaceChild(surroundingNode, oNode);
                }
                else //if start at suppply surround text from start point to end
                if(oNode==objRange.startContainer)//surround the node from the start point
                {
                    tempRange = document.createRange();
                    tempRange.setStart(oNode, objRange.startOffset);
                    tempRange.setEnd(oNode, oNode.textContent.length);
                    tempRange.surroundContents(surroundingNode);
                }
                else      //if endAt supply surround text node from 0 to End location 
                if(oNode==objRange.endContainer)//surround the node from the start point
                {
                    tempRange = document.createRange();
                    tempRange.setStart(oNode, 0);
                    tempRange.setEnd(oNode, objRange.endOffset);
                    tempRange.surroundContents(surroundingNode);
                }
            }
        }        
    },   
    
    turnOnRangeRef: function(ref) {
      // console.log("=======================================turnOnRangeRef");
      var self = this;
      
      var range = ShiftSpace.RangeCoder.toRange(ref);
      var objAncestor = range.commonAncestorContainer;
      
      if (objAncestor.nodeType == 3) // text node
          objAncestor = objAncestor.parentNode;
        
      var xPathResult = document.evaluate(".//text()", objAncestor, null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);        
      // iteratate on all the text nodes in the document and mark if they are in the selection range
      for (var i = 0, l = xPathResult.snapshotLength; i < l; i++) {
          // we need clean styles so we don't use ShiftSpace.Element
          var enclosingSpan = document.createElement("span");
          enclosingSpan.id = this.getId();
          
          enclosingSpan.setAttribute("sscutupid",this.sscutupid);
          enclosingSpan.setAttribute("class","SSCutup");
          this.surroundTextNode(xPathResult.snapshotItem(i), range, enclosingSpan);
      }
      //if cutUpArray does not exist call cutupRange on xPathResult of cutups span
      if(!this.cutupTextArray){
        var xPathQuery = "//*[@sscutupid='"  + this.sscutupid + "']";
        var xPathResult2 = document.evaluate(xPathQuery, objAncestor, null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        //iterate through snapshot & rewrite textnodes
        this.cutupRange(xPathResult2);
      }else{
        var xPathQuery = "//*[@sscutupid='"  + this.sscutupid + "']";
        var xPathResult2 = document.evaluate(xPathQuery, objAncestor, null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        //reinsert sorted array as string back into document
        for ( var i=0,l=0; i < xPathResult2.snapshotLength; i++ ){
          //if node is not empty and nodes parent is not a script tag
          if(!xPathResult2.snapshotItem(i).textContent.match(/^\s+$/) && this.isValidCutupTextNode(xPathResult2.snapshotItem(i))){
            $(xPathResult2.snapshotItem(i)).setHTML(ref.cutupsArray[l].join(""));
            l++
          }
        }
      }
    },

    cutupRange: function(xPathResult){
      var space = this.getParentSpace();
      
      if(this.cutupTextOnPage == false){
        //if there is no unsaved cutup on page then create new arrays to hold text 
        //otherwise use those current
        this.cutupTextArray = Array();  //contains cutup text nodes
        this.origTextArray = Array();   //contains precutup orig text nodes
        this.joinedTextArray = Array();   //contains text from all text nodes split into single array
        //break up snapshot into arrays of words
        for ( var i=0 ; i < xPathResult.snapshotLength; i++ ){
            if(this.isValidCutupTextNode(xPathResult.snapshotItem(i))){
              var text = xPathResult.snapshotItem(i).textContent;
              var lineArray = text.match(this.wordPattern);
              //joinedTextArray contains all arrays of words from text nodes in a single array.
              this.joinedTextArray = this.joinedTextArray.concat(lineArray);
              //do not add empty nodes to array or is content is javascript
              if(lineArray != null){ 
                this.cutupTextArray.push(lineArray); //push array of words into cutupTextArray
                this.origTextArray.push(text);  //push original text into origTextArray
              }
            }
        }
        //filter out null values and SCRIPT content
        this.joinedTextArray = this.joinedTextArray.filter(function(item,index){
            return item != null;
        });
      }
      //randomly sort joined arrays 
      this.joinedTextArray.sort(function(a,b){
          return Math.random() - 0.5;
      });
      //break up reinsert sorted item into multiline array
      //this keeps the same number of words in each node
      //while the actual words change (if 1 word chunks are selected)
      var i = 0;
      var chunkPattern = new RegExp("((\\s?\\S+)+)(\\s$)?");
      //wrap word 'chunks' in span tags
      for(var arr=0; arr<this.cutupTextArray.length; arr++){
          for(var arrItem=0; arrItem<this.cutupTextArray[arr].length; arrItem++){
              this.cutupTextArray[arr][arrItem] = this.joinedTextArray[i].replace(chunkPattern," <span class=\"SSCut\">$1</span> ");
              i++;
          }
      }
      //reinsert sorted array as string back into document
      for(var i=0,l=0; i < xPathResult.snapshotLength; i++){
        //if node is not empty
        if(!xPathResult.snapshotItem(i).textContent.match(/^\s+$/) && this.isValidCutupTextNode(xPathResult.snapshotItem(i))){
          //word chunk spans inserted with regex so must use setHTML
          if($chk(this.cutupTextArray[l])){
            $(xPathResult.snapshotItem(i)).setHTML(this.cutupTextArray[l].join(""));
            l++
          }else{
            break;
          }
        }
      } 
      //FX for fading Cutup background-color to transparent
      var sscutupid = this.sscutupid;
      function fadeToTrans(){
        snapshotNodes = document.evaluate(".//span[@sscutupid='" + sscutupid + "']", document, null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        var trans = 1.0;
        function fade(){
          if(trans > 0.2){       
            trans = trans - 0.1;
            $ES('span.SSCut',snapshotNodes.snapshotItem(i)).setStyle('outline','thin solid rgba(167,8,4,' + trans + ')');
            setTimeout(fade,50);
          }
          else
          {
            // restore original element style
            $$('.SSCut').setStyle('outline','');
          }
        }
        return fade();
      }
      fadeToTrans();
    },
    
    isValidCutupTextNode: function(node){
     return ($(node) != null && $(node) != undefined && $(node).getParent().nodeName != "SCRIPT"); 
    }
      
});

// One of the most striking signs of the decay of art is when we see its 
// separate forms jumbled together.
// -Geothe

var Cutups = new CutupsSpace(CutupsShift);
