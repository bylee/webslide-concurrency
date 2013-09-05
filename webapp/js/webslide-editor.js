( function() {
	SlidePageEditor = View.extend( {
		init: function( options ) {
			var model = this.model;
			var editor = this.editor = ace.edit( "editor" );
			this.editor.setTheme( "ace/theme/twilight" );
			this.editor.setFontSize( 15 );
			this.editor.moveCursorTo( 1, 1 );
			this.editor.getSession().setMode( "ace/mode/html" );
			this.editor.commands.addCommand( {
				name: 'Save file',
				bindKey: { win: 'Ctrl-s', mac: 'Command-s' },
				exec: function() { model.save( editor.getValue() ); }
			} );
		},

		setContents: function( text ) {
			console.log( this.$el );
			this.editor.setValue( text );
			this.editor.clearSelection();
			this.editor.focus();
		},
	} );

	SlidePageNavigator = View.extend( {
		template: 'tmpl-navigator',
		init: function( options ) {
			this.scroll = options.scroll || {
				scrollerType:"hoverPrecise", 
				scrollerOrientation:"vertical", 
				scrollSpeed:2, 
				scrollEasing:"easeOutCirc", 
				scrollEasingAmount:800, 
				acceleration:4, 
				scrollSpeed:800, 
				noScrollCenterSpace:10, 
				autoScrolling:0, 
				autoScrollingSpeed:2000, 
				autoScrollingEasing:"easeInOutQuad", 
				autoScrollingDelay:500 
			};
			this.editor = options.editor;	// SlideEditor
			this.model.on( 'load', this.renderThumbnail, this );
			this.model.on( 'selectionChange', this.onSelected, this );
		},

		renderThumbnail: function() {
			var contents = this.model.get( 'contents' );	// SlidePage
			var $el = this.$el.find( '.scroll-contents' );
			var that = this;
			_.each( this.model.get( 'pages' ), function( pid ) {
				$el.append( new SlidePageThumbnail( { parent: that, model: contents[pid] } ).render().$el );
			} );
			this.onSelected( contents[this.model.selected] );
		},

		onSelected: function( selectedPage ) {
			console.log( selectedPage );
			if ( selectedPage ) {
				this.options.editor.setContents( selectedPage.get( 'html' ) );
			}
		}
	} );

	SlidePageThumbnail = View.extend( {
		tagName: 'a',
		template: 'tmpl-thumbnail',
		events: {
			click: 'onClick'
		},
		onClick: function() {
			this.options.parent.model.onSelected( this.model.get( 'id' ) );
		}
	} );

	SlideEditor = View.extend( {
		initialize: function( options ) {
			this.editor = new SlidePageEditor( { model: this.model } );
			this.navigator = new SlidePageNavigator( {
				el: options.$navigator,
				model: this.model,
				editor: this.editor
			} ).render();
			this.model.on( 'load', this.render, this );
			this.model.fetch();
		},
		render: function() {
			if ( !this.model.get( 'sid' ) ) {
				if ( this.mode == 'wait' ) {
					return this;
				}
				this.spinner = new SpinnerView( { model: new SpinnerOption() } );
				this.$el.append( this.spinner.render().$el );
				this.mode = 'wait';
				return this;
			}

			this.spinner.destroy();

			return this;
		},
	} );

} ) ();
