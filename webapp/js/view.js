( function() {
	json = function( model ) {
		var ret = (model && model.toJSON)?model.toJSON():model;
		if ( ! ( typeof ret == "object" ) ) {
			return ret;
		}

		for ( var k in ret ) {
			ret[k] = json( ret[k] );
		}
		return ret;
	};
	View = Backbone.View.extend( {
		initialize: function( options ) {
			_.bindAll( this );
			var m = (this.modelClass)?new this.modelClass():new Model();
			if ( m instanceof Collection ) {
				this.collection = this.collection || m;
				this.model = this.model || new Model();
			} else if ( m instanceof Model ) {
				this.model = this.model || m;
			}
			this.init( options );
			if ( this.collection ) {
				this.collection.fetch();
			}
			this.$el.attr( 'view-cid', this.cid );
		},
		init: function( options ) {
		},
		render: function() {
			var m = json( this.model );
			this.$el.html( _.template( $( '#' + this.template ).html() )( m ) );
			return this;
		},
		addSubView: function( model ) {
		}
	} );

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
