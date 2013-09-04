( function() {
	SlidePageEditor = View.extend( {
		init: function() {
			this.editor = CodeMirror.fromTextArea( this.el, {
				mode: 'text/html'
			} );
		},
		setContents: function( text ) {
			console.log( this.$el );
			this.$el.html( text );
		}
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
			this.slide = options.slide;
			this.editor = options.editor;	// SlideEditor
			options.slide.on( 'load', this.renderThumbnail, this );
		},

		renderThumbnail: function() {
			var contents = this.slide.get( 'contents' );	// SlidePage
			var $el = this.$el.find( '.scroll-contents' );
			var that = this;
			_.each( this.slide.get( 'pages' ), function( pid ) {
				$el.append( new SlidePageThumbnail( { parent: that, model: contents[pid] } ).render().$el );
			} );
		},

		onSelect: function( selectedPage ) {
			this.options.editor.setContents( selectedPage.get( 'html' ) );
		}
	} );

	SlidePageThumbnail = View.extend( {
		tagName: 'a',
		template: 'tmpl-thumbnail',
		events: {
			click: 'onClick'
		},
		onClick: function() {
			this.options.parent.onSelect( this.model );
		}
	} );

	SlideEditor = View.extend( {
		initialize: function( options ) {
			this.editor = new SlidePageEditor( { el: options.$editor } );
			this.navigator = new SlidePageNavigator( {
				el: options.$navigator,
				editor: this.editor,
				slide: this.model
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
