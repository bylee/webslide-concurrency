( function() {
	SlidePageEditor = View.extend( {
	} );

	SlidePageNavigator = View.extend( {
		template: 'tmpl-navigator',
		init: function( options ) {
			options.scroll = options.scroll || {
				scrollerType:"clickButtons", 
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
			this.$el.thumbnailScroller( options.scroll );
			this.slide = options.slide;
			options.slide.on( 'load', this.renderThumbnail, this );
		},
		renderThumbnail: function() {
			var contents =this.slide.get( 'contents' );
			var $el = this.$( '.jTscroller' );
			_.each( this.slide.get( 'pages' ), function( pid ) {
				$el.append( new SlidePageThumbnail( { contents: contents[pid] } ).render().$el );
			} );
		}
	} );
	SlidePageThumbnail = View.extend( {
		tagName: 'a',
		template: 'tmpl-thumbnail',
		init: function( options ) {
			console.log( '-', options.contents );
		}
	} );

	SlideEditor = View.extend( {
		initialize: function() {
			this.navigator = new SlidePageNavigator( { el: this.$navigator, slide: this.model } );
			this.editor = new SlidePageEditor( { el: this.$editor } );
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

			this.$el.append( this.navigator.render().$el );

			this.spinner.destroy();

			return this;
		}
	} );

} ) ();
