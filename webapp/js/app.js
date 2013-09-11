( function() {
	request = function( url, type, data, success ) {
		return $.ajax( url, {
			type: type,
			Accept: "application/json",
			contentType: "application/json",
			dataType: 'json',
			data: JSON.stringify( data ),
			success: success
		} );
	};

	Router = Backbone.Router;
	Model = Backbone.Model;
	Collection = Backbone.Collection;
	View = Backbone.View.extend( {
		initialize: function( options ) {
			_.bindAll( this );
			this.initModel( options );

			this.$el.attr( 'view-cid', this.cid );
			var m = json( this.model );
			this.$el.html( _.template( $( '#tmpl-' + this.template ).html() )( m ) );
			if ( this.fields ) {
				for ( index in this.fields ) {
					var field = this.fields[index];
					this['$' + field] = this.$el.find( '#' + field );
				}
			}
			this.init( options );
			if ( this.collection ) {
				this.collection.fetch();
			}
		},
		initModel: function( options ) {
			var m = (this.modelClass)?new this.modelClass():new Model();
			if ( m instanceof Collection ) {
				this.collection = this.collection || m;
				this.model = this.model || new Model();
			} else if ( m instanceof Model ) {
				this.model = this.model || m;
			}
		},
		init: function( options ) {
		},
		render: function() {
			return this;
		},
		addSubView: function( model ) {
		}
	} );


	PopupHeader = View.extend( {
		template: 'popup-header',
		className: 'modal-header'
	} );
	PopupFooter = View.extend( {
		template: 'popup-footer',
		className: 'modal-footer',
		events: {
			'click a': 'onClick'
		},
		onClick: function( e ) {
			var id = $( e.target ).attr( 'id' );
			if ( this.model.get( 'buttonHandler' ) ) {
				this.model.get( 'buttonHandler' )( this.options.popup, id );
			}
		}
	} );

	Popup = View.extend( {
		template: 'popup',
		initModel: function( options ) {
			this.model = this.model || new Model( { title: 'Popup' } );
			options.header = options.header || PopupHeader;
			options.footer = options.footer || PopupFooter;
			this.header = new options.header( { model: this.model, popup: this } );
			this.body = new options.body( { model: this.model, popup: this } );
			this.footer = new options.footer( { model: this.model, popup: this } );
		},
		render: function() {
			this.$el.find( '.modal-content' ).append( this.header.render().$el );
			this.$el.find( '.modal-content' ).append( this.body.render().$el );
			this.$el.find( '.modal-content' ).append( this.footer.render().$el );
			return this;
		},
		open: function() {
			var that = this;
			this.render();
			this.$el.on( 'hidden.bs.modal', function() {
				that.$el.remove();
			} );
			$( 'body' ).append( this.$el );
			this.$el.find( '.modal' ).modal( { backdrop: 'static' } );
		}
	} );

} ) ();
