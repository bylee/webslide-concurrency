( function() {

	NewPageDialog = Popup.extend( {
	} );

	SlidePageEditor = View.extend( {
		init: function( options ) {
			var that = this;
			var model = this.model;
			var editor = this.editor = ace.edit( "editor" );
			this.editor.setBehavioursEnabled( true );
			this.editor.autoIndent = true;
			this.editor.autoComplete = true;
			this.editor.setTheme( "ace/theme/twilight" );
			this.editor.setFontSize( 15 );
			this.editor.moveCursorTo( 1, 1 );
			this.editor.getSession().setMode( "ace/mode/html" );
			this.editor.commands.addCommand( {
				name: 'Save file',
				bindKey: { win: 'Ctrl-s', mac: 'Command-s' },
				exec: function() { model.save( that.page, editor.getValue() ); }
			} );
			model.on( 'pageChange', this.onPageChange, this );
		},

		setContents: function( page ) {
			this.page = page;
			this.editor.setValue( page.get( 'html' ) );
			this.editor.clearSelection();
			this.editor.focus();
		},
		onPageChange: function( page ) {
			if ( this.page == page ) {
				this.setContents( page );
			}
		}
	} );

	SlidePageNavigator = View.extend( {
		template: 'navigator',
		fields: [ 'moveUp', 'moveDown', 'addPage', 'removePage' ],
		events: {
			'click #moveUp': 'moveUp',
			'click #moveDown': 'moveDown',
			'click #addPage': 'addPage',
			'click #removePage': 'removePage',
		},
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
			$el.empty();
			_.each( this.model.get( 'pages' ), function( pid ) {
				$el.append( new SlidePageThumbnail( { parent: that, model: contents[pid] } ).render().$el );
			} );
			this.onSelected( contents[this.model.selected] );
		},

		onSelected: function( selectedPage ) {
			if ( this.selectedPage == selectedPage ) {
				return ;
			}
			if ( this.selectedPage ) {
				this.selectedPage.set( 'selected', null );
				this.selectedPage.trigger( 'selectionStateChanged' );
			}
			if ( selectedPage ) {
				this.options.editor.setContents( selectedPage );
			}
			this.selectedPage = selectedPage;
			this.selectedPage.set( 'selected', true );
			this.selectedPage.trigger( 'selectionStateChanged' );
		},
		getSelection: function() {
			return this.selectedPage;
		},
		previous: function( id ) {
			if ( null == id ) {
				return null;
			}
			var prev = null;
			_.find( this.model.get( 'pages' ), function( pid ) {
				if ( id==pid ) {
					return true;
				}
				prev = pid;
				return false;
			} );
			return prev;
		},

		next: function( id ) {
			if ( null == id ) {
				return null;
			}
			var prev = null;
			return _.find( this.model.get( 'pages' ), function( pid ) {
				if ( prev ) {
					return true;
				}
				if ( id==pid ) {
					prev = pid;
				}
				return false;
			} );
		},
		moveUp: function() {
			var id = this.selectedPage.get( 'id' );
			var target = this.previous( this.previous( id ) );
			this.move( id, target );
		},
		moveDown: function() {
			var id = this.selectedPage.get( 'id' );
			var target = this.next( id );
			if ( null == target ) {
				return ;
			}
			this.move( id, target );
		},
		move: function( id, nextTo ) {
			console.log( "Move", id, "next to", nextTo );
			var taht = this;
			request( '/pages/' + id, 'PUT', { next: nextTo }, function() {
			} );
			var pages = that.model.get( 'pages' );
			var step = (nextTo)?0:1;
			var temp = id;
			var target = 0;
			_.find( pages, function( p, index ) {
				if ( 0 == step ) {
					if ( p == id ) {
						target = index;
						step = -1;
					} else if ( p == nextTo ) {
						target = index;
						step = 1;
					}
				} else {
					var t2 = page[index];
					page[index] = temp;
					temp = t2;
					if ( p == nextTo ) {
						return true;
					}
				}
				return false;
			} );
			target = id;
		},
		addPage: function() {
			new Popup( {
				model: new Model( {
					title: 'New Page',
					buttonHandler: function( popup, id ) {
						if ( 'ok' == id ) {
							console.log( "Not implemented - New Page" );
						}
					}
				} ),
				body: View.extend( {
					className: 'modal-body',
					template: 'popup-new-page',
					fields: ['name']
				} )
			} ).open();
		},
		removePage: function() {
			console.log( 'remove' );
		},
	} );

	SlidePageThumbnail = View.extend( {
		tagName: 'a',
		template: 'thumbnail',
		events: {
			'click': 'onClick'
		},
		init: function() {
			var $el = this.$el
			this.model.on( 'contentChanged', this.contentChanged, this );

			this.model.on( 'selectionStateChanged', this.selectionStateChanged, this );
			this.$thumbnail = this.$( '.preview-thumbnail' );
			this.$thumbnail.attr( 'src', '/preview.html?id=' + this.model.get( 'id' ) );
		},

		render: function() {
			this.selectionStateChanged();
			return this;
		},

		onClick: function() {
			this.options.parent.model.onSelected( this.model.get( 'id' ) );
		},

		selectionStateChanged: function() {
			if ( this.model.get( 'selected' ) ) {
				this.$el.addClass( 'selected' );
			} else {
				this.$el.removeClass( 'selected' );
			}
		},
		contentChanged: function() {
			this.$thumbnail.attr( 'src', '/preview.html?id=' + this.model.get( 'id' ) );
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
			this.navigator.onSelected( this.model.get( 'contents' )[this.model.get( 'pages' )[0]] );

			return this;
		},
	} );

} ) ();
