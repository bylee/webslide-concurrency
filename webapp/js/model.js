( function() {

	Router = Backbone.Router;
	Model = Backbone.Model;
	Collection = Backbone.Collection;

	SpinnerOption = Model.extend( {
		defaults: {
			lines: 13, // The number of lines to draw
			length: 20, // The length of each line
			width: 10, // The line thickness
			radius: 30, // The radius of the inner circle
			corners: 1, // Corner roundness (0..1)
			direction: 1, // 1: clockwise, -1: counterclockwise
			color: '#000', // #rgb or #rrggbb or array of colors
			speed: 1, // Rounds per second
			trail: 60, // Afterglow percentage
			shadow: false, // Whether to render a shadow
			hwaccel: true, // Whether to use hardware acceleration
			className: 'spinner', // The CSS class to assign to the spinner
			zIndex: 2e9, // The z-index (defaults to 2000000000)
		}
	} );

	SlidePage = Model.extend( {
		fetch: function() {
			var page = this;
			var slide = this.get( 'slide' );
			$.get( '/pages/' + this.get( 'id' ), function( html ) {
				page.set( 'html', html );
				slide.set( 'iPage', slide.get( 'iPage' ) + 1 );
				page.trigger( 'change' );
			} );
		}
	} );

	Slide = Model.extend( {
		defaults: {
			dependencies: [
				// Cross-browser shim that fully implements classList - https://github.com/eligrey/classList.js/
				{ src: '/js/classList.js', condition: function() { return !document.body.classList; } },
		  
				// Interpret Markdown in <section> elements
				//{ src: 'plugin/markdown/marked.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
				//{ src: 'plugin/markdown/markdown.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
			
				// Syntax highlight for <code> elements
				//{ src: '/js/highlight.js', async: true, callback: function() { hljs.initHighlightingOnLoad(); } },
			
				// Zoom in and out with Alt+click
				//{ src: 'plugin/zoom-js/zoom.js', async: true, condition: function() { return !!document.body.classList; } },
			
				// Speaker notes
				//{ src: 'plugin/notes/notes.js', async: true, condition: function() { return !!document.body.classList; } },
			
				// Remote control your reveal.js presentation using a touch device
				//{ src: 'plugin/remotes/remotes.js', async: true, condition: function() { return !!document.body.classList; } },
			
				// MathJax
				//{ src: 'plugin/math/math.js', async: true }
			],
			// Display controls in the bottom right corner
			controls: false,

			// Display a presentation progress bar
			progress: false,

			// Push each slide change to the browser history
			history: false,

			// Enable keyboard shortcuts for navigation
			keyboard: true,

			// Enable touch events for navigation
			touch: true,

			// Enable the slide overview mode
			overview: false,

			// Vertical centering of slides
			center: true,

			// Loop the presentation
			loop: false,

			// Change the presentation direction to be RTL
			rtl: false,

			// Number of milliseconds between automatically proceeding to the
			// next slide, disabled when set to 0, this value can be overwritten
			// by using a data-autoslide attribute on your slides
			autoSlide: 0,

			// Enable slide navigation via mouse wheel
			mouseWheel: false,

			// Transition style
			transition: 'default', // default/cube/page/concave/zoom/linear/fade/none

			// Transition speed
			transitionSpeed: 'default', // default/fast/slow

			// Transition style for full page backgrounds
			backgroundTransition: 'default' // default/linear/none
		},
		initialize: function() {
			this.on( 'load', this.onLoad, this );
		},
		url: function() {
			return '/slides/' + this.get( 'id' );
		},
		parse: function( data ) {
			var slide = this;
			var contents = {};
			_.each( data.pages, function( pid ) {
				page = new SlidePage( { slide: slide, id: pid } );
				page.on( 'change', slide.onPageChange, slide );
				page.fetch();
				contents[pid] = page;
			} );

			this.set( 'pages', data.pages );
			this.set( 'iPage', 0 );
			this.set( 'nPage', data.pages.length );
			this.set( 'contents', contents );

			return ;
		},

		onPageChange: function() {
			if ( this.get( 'iPage' ) == this.get( 'nPage' ) ) {
				this.set( 'sid', this.get( 'id' ) );
				this.trigger( 'load' );
			}
		}
	} );



} ) ();
