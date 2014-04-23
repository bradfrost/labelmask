/*! Labelmask - v0.1.0 - 2014-04-23
 * Inserts input-masking-style functionality into labels without disrupting the input itself.
 * Based on Politespace by Filament Group https://github.com/filamentgroup/politespace
 * Hacked apart by Brad Frost. Propert development welcome
 * MIT License */

(function( w ){
	"use strict";

	var Labelmask = function( element ) {
		if( !element ) {
			throw new Error( "Labelmask requires an element argument." );
		}

		if( !element.getAttribute ) {
			// Cut the mustard
			return;
		}

		var groupRegMatch;

		this.element = element;

		this.elID = this.element.id;

		this.groupLength = this.element.getAttribute( "data-grouplength" ) || 3;
		groupRegMatch = this._buildRegexArr( this.groupLength );

		this.spacer = this.element.getAttribute( "data-spacer" ) || ' ';

		this.placeholder = this.element.placeholder;

		this.elLabel = $("[for="+this.elID+"]");

		this.groupRegNonUniform = groupRegMatch.length > 1;
		this.groupReg = new RegExp( groupRegMatch.join( '' ), !this.groupRegNonUniform ? 'g' : '' );
	};

	Labelmask.prototype._buildRegexArr = function( groupLengths ) {
		var split = ( '' + groupLengths ).split( ',' ),
			str = [];

		for( var j = 0, k = split.length; j<k; j++ ) {
			str.push( '([\\S]{' + ( split[ j ] === '' ? '1,' : split[j] ) + '})' + ( j > 0 ? "?" : "" ) );
		}

		return str;
	};

	Labelmask.prototype.format = function( value ) {
		var val = value,
			match;

		if( this.groupRegNonUniform ) {
			match = val.match( this.groupReg );
			if( match ) {
				match.shift();

				for( var j = 0; j < match.length; j++ ) {
					if( !match[ j ] ) {
						match.splice( j, 1 );
						j--;
					}
				}
			}

			val = ( match || [ val ] ).join( this.spacer );
		} else {
			val = val.replace( this.groupReg, "$1 " );

			if( val.substr( val.length - 1 ) === " " ) {
				val = val.substr( 0, val.length - 1 );
			}
		}

		return val;
	};

	Labelmask.prototype.update = function() {
		var maxlength = this.element.getAttribute( "maxlength" ),
			val = this.format( this.element.value );

		if( maxlength ) {
			val = val.substr( 0, maxlength );
		}

		this.element.value = val;
	};

	Labelmask.prototype.unformat = function( value ) {
		return value.replace( /\s/g, '' );
	};

	Labelmask.prototype.reset = function() {
		this.element.value = this.unformat( this.element.value );
	};

	Labelmask.prototype.addLabelMask = function() {
		if(this.elLabel.find('.labelmask').length === 0) {
			this.elLabel.append('<span class="labelmask"></span>');
		}
	};

	Labelmask.prototype.updateLabelMask = function( val ) {
		var maskedText = this.mask(),
			formattedText = this.format(maskedText);
		this.elLabel.find('.labelmask').html(" " + formattedText);
	};

	Labelmask.prototype.removeLabelMask = function( ) {
		this.elLabel.find('.labelmask').remove();
	};

	Labelmask.prototype.mask = function() {
		var charCount = this.element.value.length,
			placeholderSub = this.placeholder.replace(/ /g,'').replace(/-/g,'').substr( charCount ),
			val = this.element.value + placeholderSub;
		console.log(val);
		return val;
	};

	w.Labelmask = Labelmask;

}( this ));

(function( $ ) {
	"use strict";

	// jQuery Plugin

	var componentName = "labelmask",
		enhancedAttr = "data-enhanced",
		initSelector = "[data-" + componentName + "]:not([" + enhancedAttr + "])";

	$.fn[ componentName ] = function(){
		return this.each( function(){
			var polite = new Labelmask( this );

			$( this ).bind( "blur", function() {
					polite.update();
					polite.removeLabelMask();
				})
				.bind( "focus", function() {
					polite.reset();
					polite.addLabelMask();
				})
				.bind( "keyup", function() {
					polite.updateLabelMask($(this).val());

				})
				.data( componentName, polite );

			polite.update();
		});
	};

	// auto-init on enhance (which is called on domready)
	$( document ).bind( "enhance", function( e ) {
		var $sel = $( e.target ).is( initSelector ) ? $( e.target ) : $( initSelector, e.target );
		$sel[ componentName ]().attr( enhancedAttr, "true" );
	});

}( jQuery ));
