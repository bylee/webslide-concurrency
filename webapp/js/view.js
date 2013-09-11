( function() {
	json = function( model ) {
		var ret = (model && model.toJSON)?model.toJSON():model;
		if ( ! ( typeof ret == "object" ) ) {
			return ret;
		}

		return ret;
	};
	SpinnerView = View.extend( {
		className: 'spin',
		render: function() {
			this.$spin = new Spinner( this.model.toJSON() );
			this.$spin.spin();
			this.$curton = $( '<div class="curton"></div>' );
			$( 'body' ).append( this.$curton );
			this.$el.append( this.$spin.el );
			return this;
		},

		destroy: function() {
			this.$curton.remove();
			this.$el.remove();
		}
	} );

	SlidePageView = View.extend( {
		className: 'slides',
		render: function() {
			this.$el.html( this.model.get( 'html' ) );
			return this;
		}
	} );

	SlideShow = View.extend( {
		className: 'reveal',
		initialize: function() {
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

			var contents = this.model.get( 'contents' );
			var pageIds = this.model.get( 'pages' );
			var that = this;
			_.each( pageIds, function( pid ) {
				var pageView = new SlidePageView( { model: contents[pid] } );

				that.$el.append( pageView.render().$el );
			} );
			this.spinner.destroy();

			Reveal.initialize( this.model.toJSON() );

			return this;
		}
	} );

	SlidePageEditor = View.extend( {
	} );
} ) ();
