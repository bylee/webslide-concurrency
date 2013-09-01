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

	Controller = Router.extend( {
		routes: {
			"": "moveToValidation",
			"slide": "slides",
		},
		initialize: function( options ) {
		},
		slides: function() {
		}
	} );

	PopupHeader = View.extend( {
		template: 'tmpl-popup-header',
		className: 'modal-header'
	} );
	PopupFooter = View.extend( {
		template: 'tmpl-popup-footer',
		className: 'modal-footer'
	} );

	Popup = View.extend( {
		className: 'modal hide fade',
		initialize: function( options ) {
			this.model = this.model || new Model( { title: 'Popup' } );
			this.$el.html( _.template( $( '#' + this.template ).html() ) );
			options.header = options.header || PopupHeader;
			options.footer = options.footer || PopupFooter;
			this.header = new options.header( { model: this.model } );
			this.body = new options.body( { model: this.model } );
			this.footer = new options.footer( { model: this.model } );
		},
		render: function() {
			this.$el.append( this.header.render().$el );
			this.$el.append( this.body.render().$el );
			this.$el.append( this.footer.render().$el );
			return this;
		},
		open: function() {
			var that = this;
			this.render();
			this.$el.on( 'hidden', function() {
				that.$el.remove();
			} );
			this.$el.modal();
			$( 'body' ).append( this.$el );
		}
	} );

} ) ();
