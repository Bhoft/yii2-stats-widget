;(function ( $, window, document ) {

    var defaults = {
		btnHome: '.stwg-btn-home',
		btnPrev: '.stwg-btn-prev',
		btnNext: '.stwg-btn-next',
		btnZoomIn: '.stwg-btn-zoomin',
		btnZoomOut: '.stwg-btn-zoomout',
		rangeLabel: '.stwg-range-label',
		levels: [],
		period: 'P1M',
		range: 'P1D',
    }
    	
    function StatsWidget( element, opts ) {
        var $el = this.$el = $(element);
        this.canvas = $el.find('canvas').get(0);
        //var sets = JSON.parse($el.attr('data-StatsWidget-sets'));
        //this.opts = $.extend( {}, defaultOpts, sets, opts) ;
        var opts0 = {
        	pjaxId : element.id + '-pjax',
        	pjaxListId : element.id + '-list-pjax',
        };
        this.opts = $.extend( {}, defaults, opts0, opts) ;
        this.state = {};
        this.init();
    }
    
    StatsWidget.prototype = {
    		
        init: function() {
        	var self = this;
        	var binds = {
    			btnHome: 'home',
    			btnPrev: 'prev',
    			btnNext: 'next',
    			btnZoomIn: 'zoomIn',
    			btnZoomOut: 'zoomOut'
        	};
        	for (var btn in binds) {
        		var selector = this.opts[btn];
        		var fn = binds[btn];
        		this.$el.on('click', selector, this[fn].bind(this));
        	}
        	this.load();
        },
        
        load: function(period, range, start, end) {
        	
        	var query = $.param({ period: period, range: range, start: start, end: end });
        	$.getJSON(this.opts.statsAction, query, function (data) {
        		
        		this.state = $.extend(this.state, data.state);
        		console.log(this.state);
        		this.render(data.stats);
				
        	}.bind(this));
        	
        },
        
        render: function(stats) {
        	
        	if (this.chartjs) {
        		this.chartjs.destroy();
        	}

			var labels = stats.data.map(function (item) {
				return item.label;
			});
			var values = stats.data.map(function (item) {
				return item.value;
			});
    		  
			var ctx = this.canvas.getContext('2d');
			var chart = {
			    type: 'bar',
			    data: {
			        labels: labels,
			        datasets: [{
			            data: values
			        }]
			    }
			};
			
			chart = $.extend(true, chart, this.opts.chartJsOptions);
			this.chartjs = new Chart(ctx, chart);
			$(this.opts.rangeLabel, this.$el).text(this.state.rangeLabel);
        	
        },
        
        levelFindCurrent: function() {
        	for (var l=0; l<this.opts.levels.length; l++) {
        		var level = this.opts.levels[l];
        		if (level[0] == this.state.period) {
        			return level;
        		}
        	};
        	return null;
        },
        
        home: function() {
        	this.load(this.state.period, this.state.range, null);
        },
        prev: function() {
        	this.load(this.state.period, this.state.range, this.state.prev);
        },
        next: function() {
        	this.load(this.state.period, this.state.range, this.state.next);
        },
        zoomIn: function() {
        	var level = this.levelFindCurrent();
        	if (!level) return;
        	var nextIdx = this.opts.levels.indexOf(level) + 1;
        	if (nextIdx >= this.opts.levels.length) return;
        	level = this.opts.levels[nextIdx];
        	this.load(level[0], level[1], this.state.start);
        },
        zoomOut: function() {
        	var level = this.levelFindCurrent();
        	if (!level) return;
        	var nextIdx = this.opts.levels.indexOf(level) - 1;
        	if (nextIdx < 0) return;
        	level = this.opts.levels[nextIdx];
        	this.load(level[0], level[1], this.state.start);
        },

    };

$.fn['statsWidget'] = function ( options ) {
    return this.each(function () {
    	var cmnts = $.data(this, "statsWidget"); 
        if (!cmnts) {
            $.data(this, "statsWidget", new StatsWidget( this, options ));
        } else {
        	if (typeof options == 'string') {
        		cmnts[options]();
        	}
        }
    });
};

})( jQuery, window, document );