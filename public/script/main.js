//TODO: 第一次进频道或者下拉刷新时, 或者频道过期后再切回来, 都显示更新数量
function showNewsNum(num) {
	var callbackMsg = $('#callback-msg');
	num = num > 10 ? 10 : num;
	callbackMsg.innerText = arguments[0] ? '为您推荐' + num + '篇文章' : '暂无新推荐';
	setTimeout(function() {
		callbackMsg.style.opacity = '1';
	}, 500);
	setTimeout(function() {
		callbackMsg.style.opacity = '0';
		setTimeout(function() {
			callbackMsg.innerText = '暂无新推荐';
		}, 500);
	}, 1500);
}

//撕逼头条两方样式
function sibiStyle(ele, num_part, sum) {
	//红色全宽底, 绿色半宽顶, 一条与背影色相同的线
	var chart = '<div class="sg-chart"><div class="pros"></div><div id="pros_support"></div><div id="cons_support"></div></div>';
	var articleContainer = $('.sg-article-container');
	articleContainer.innerHTML += chart;
	setTimeout(function() {
		$('.sg-chart', articleContainer).children[0].style.width = num_part / sum * $('.sg-chart').offsetWidth - $('.sg-chart').offsetHeight / 2 + 'px';
	}, 500);
}

function sibiMedia(data) {
	var pros = data.pros_news;
	var cons = data.cons_news;
	var str = '<div class="sg-list sg-sibi-media">';
	var tempStr = '<ul class="article">';
	var tempStr1 = '<ul class="article">';
	tempStr += renderSibiMedia(pros[0], true);
	tempStr += renderSibiMedia(cons[0], false);
	tempStr1 += renderSibiMedia(pros[1], true);
	tempStr1 += renderSibiMedia(cons[1], false);
	tempStr += '</ul>';
	tempStr1 += '</ul>';
	return str + tempStr + tempStr1 + '</div>';
}

function renderSibiMedia(obj, bool) {
	var currentTime = globalObj.config.currentTime;
	if (obj.image) {
		return '<li><a href=#article?s=' + obj.name + '><div class="thumb" style="background: url(' + obj.image + ') 50% 0% / cover no-repeat transparent;" data-src=""></div><h2 class="">' + obj.title + '</h2><span class="count spe"><i class="type '+ (bool? 'editor">绿方':'hot">红方') + '</i>' + (obj.source ? ('<i class="source">' + obj.source.name + '</i>') : '') + '<i class="time">' + (obj.publish_time ? globalObj.timeFormat(currentTime - obj.publish_time * 1000) : '') + '</i></span></a></li>';
	} else {
		return '<li class="spe"><a href=#article?s=' + obj.name + '><h2 class="long-line">' + obj.title + '</h2><span class="count spe"><i class="type '+ (bool?'editor">绿方':'hot">红方') + '</i>' + (obj.source ? ('<i class="source">' + obj.source.name + '</i>') : '') + '<i class="time">' + (obj.publish_time ? globalObj.timeFormat(currentTime - obj.publish_time * 1000) : '') + '</i></span></a></li>';
	}
}

function $(selector, context) {
	return (context || document).querySelector(selector);
}

function $$(selector, context) {
	return (context || document).querySelectorAll(selector);
}



function renderListCallback(data) {
	return globalObj.renderListCallback(data);
}

function renderArticleCallback(data) {
	return globalObj.renderArticleCallback(data);
}

function updateGeted(data) {
	return globalObj.updateGeted(data);
}

function sibicallback(data) {
	return globalObj.sibicallback(data);
}

function removeElement(ele) {
	return ele.parentNode.removeChild(ele);
}

function emptyElement(ele) {
	return ele.innerHTML = '';
}

function emptyStyle(ele) {
	return ele.style.cssText = '';
}

function addClass(ele, str) {
	ele.classList.add(str);
}

function removeClass(ele, str) {
	ele.classList.remove(str);
}

function insertAfter(newEle, targetEle) {
	var parentEle = targetEle.parentNode;
	if (parentEle.lastChild == targetEle) {
		parentEle.appendChild(newEle);
	} else {
		parentEle.insertBefore(newEle, targetEle.nextSbling);
	}
}

//视口大小用类控制
function setStyleEle(viewWidth, viewHeight) {
	var style = document.getElementsByTagName('style')[0];
	style.innerText = '.viewHeight:{' + viewHeight + 'px;}.viewWidth:{' + viewWidth + '};';
}

//默认背景图替换
var imageLoaderHelper = function(flag, img, id, src) {
	if (flag) img.dataset.src = '';
	src = flag ? src : defaultSRCMap[id];
	switch (id) {
		case 'news':
			img.style.cssText = 'background: transparent url(' + src + ') no-repeat center top; background-size: cover;';
			break;
		default:
			img.src = src;
			break;
	}
};

var defaultSRCMap = {
	'news': './public/img/default.png'
};

var imageLoaderManager = (function() {
	var list = [];

	function load(src, cb) {
		var cb = typeof cb === 'function' ? cb : function() {};
		var img = document.createElement('img');
		img.onload = function() {
			img.onerror = img.onload = null;
			cb(true);
		};
		img.onerror = function() {
			img.onerror = img.onload = null;
			cb(false);
			list.push([src, cb]);
		};
		img.src = src;
	}
	window.addEventListener('online', function() {
		var item, stack = list.slice(0);
		list.length = 0;
		while (item = stack.pop()) {
			load(item[0], item[1]);
		}
	}, false);
	return {
		load: load
	};
})();

var meitiScroll;

var globalObj = {
	dbody: document.body,
	scrollTop: 0,
	readed: false,
	eleData: {
		container: $('#container'),
		article: $('#article'),
		edit: $('#edit'),
		articleContainer: $('.sg-article-container'),
		sgList: $('.sg-list')
	},
	opeInfo: {
		change: false, //是否切标签
		direction: false, //方向
		num: 0
	},
	keyWord: {
		"hot": "热门",
		"editor": "精品"
	},
	guid: (function() { //生成uuid
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
		}
		return function() {
			return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
				s4() + '-' + s4() + s4() + s4();
		};
	})(),
	pingback: function(type, hid, obj) {
		var img = document.createElement('img');
		var baseUrl = 'http://ping.hotspot.ie.sogou.com/news.gif?src=h5&type=' + type + '&hid=' + hid;
		var keys = Object.keys(obj);
		for (var i = keys.length - 1; i >= 0; i--) {
			baseUrl += '&' + keys[i] + '=' + obj[keys[i]];
		};
		img.src = baseUrl;
	},
	createScript: function(url) { //jsonp
		var script = document.createElement('script');
		script.src = url;
		this.dbody.appendChild(script);
		setTimeout(function() {
			removeElement(script);
		}, 5000);
	},
	config: {
		domain: 'http://10.134.24.229/discover_agent',
		//当前时间(服务器时间)
		currentTime: 0,
		//当前频道
		currentLabel: decodeURIComponent(~location.hash.indexOf('&label=') ? location.hash.slice(1).match(/label=(.*)[&\s\n]?/) && location.hash.slice(1).match(/label=(.*)[&\s\n]?/)[1] : location.hash.slice(1)) || '头条',
		iconType: location.href.match(/iconType=([a-zA-Z0-9]*)/) && location.href.match(/iconType=([a-zA-Z0-9]*)/)[1],
		//每个频道的内容及频道最后一次请求新数据的时间
		listArray: {}
	},
	//非hash跳转时
	getBig: function() {

	},
	loadMoreText: function(bool) {
		$('.load-more').innerHTML = bool ? '<span>正在加载...</span>' : '';
	},
	//list页时间转换
	timeFormat: function(time) {
		time = +time <= 0 ? 0 : time;
		if (0 == time) {
			return '刚刚';
		}
		var day = 86400000;
		var hour = 3600000;
		var minute = 60000;
		var totalDay = parseInt(time / day);
		var totalHour = parseInt((time % day) / hour);
		var totalMinu = parseInt((time % day % hour) / minute);
		return totalDay ? totalDay + '天前' : '' + (totalHour ? totalHour + '小时' : '') + (totalHour ? '' : (totalMinu ? totalMinu : '0') + '分钟') + '前';
	},
	//详情页时间转换
	dateFormat: function(time) {
		time = new Date(time);
		var date = dateForm(time.getDate() - 1, true); //日期减1
		var month = dateForm(time.getMonth() + 1); //月份加1
		var hour = dateForm(time.getHours());
		var minute = dateForm(time.getMinutes());

		function dateForm(item, bool) {
			item = item + (bool ? 1 : '') + '';
			item = item.length < 2 ? '0' + item : item;
			return item;
		}
		return month + '-' + date + '  ' + hour + ':' + minute;
	},
	sibiDate: function(date) {
		var curDate = new Date(date);
		return (1900 + curDate.getYear()) + '0' + (curDate.getMonth() + 1) + '' + curDate.getDate();
	},
	getsibi: function(date) {
		var self = this;
		//var baseUrl = this.config.domain + '?phone=1&cmd=getsibi&date=' + self.sibiDate(self.config.currentTime) + '&callback=sibicallback';
		var baseUrl = this.config.domain + '?phone=1&cmd=getsibi&date=' + 20150520 + '&callback=sibicallback';
		this.createScript(baseUrl);
	},
	sibicallback: function(data) {
		setTimeout(function() {
			$('#container').className += ' noScroll sg-hide';
		}, 0);

		var self = this;
		var article = self.eleData.article;
		var articleContainer = $('.sg-article-container');
		console.log(data);
		var sibi = data.app_cmd[0].cmd[0].sibi;
		sibi.pros_num = 20;
		sibi.cons_num = 80;
		articleContainer.innerHTML += '<p class="sg-chart-intro">' + sibi.intro + '</p>';
		//正反方对比
		sibiStyle($('.big', article), sibi.pros_num, sibi.pros_num + sibi.cons_num);
		articleContainer.innerHTML += '<div class=sg-chart-text><span class="sg-chart-text-pros">' + sibi.pros_title + '</span><span class="sg-chart-text-cons">' + sibi.cons_title + '</span></div>';
		articleContainer.innerHTML += '<div class=sg-sibi-media-cantainer>' + sibiMedia(sibi) + '</div>';
		setTimeout(function() {
			[].slice.call($$('.sg-sibi-media-cantainer .article')).forEach(function(item) {
				item.style.width = $('.sg-sibi-media-cantainer').offsetWidth + 'px';
			});
			setTimeout(function() {
				meitiScroll = new IScroll('.sg-sibi-media-cantainer', {
					eventPassthrough: true,
					scrollX: true,
					scrollY: false
				});
			}, 200);
		}, 400);
	},
	//三个大layer切换
	layerSwitch: function(sup, sub) {
		removeClass(sup, 'sg-hide');
		addClass(sub, 'sg-hide');
		sub.style.height = this.viewHeight + 'px';
	},
	//渲染频道
	renderSelected: function() {
		var str = '';
		var self = this;
		//当前频道是否被删除
		var currentDeleted = false;
		editData.forEach(function(item, index) {
			if (item.val) {
				var itemText = item.abbr ? item.abbr : item.name;
				str += '<li class="' + (self.config.currentLabel == item.name ? 'current' : '') + '"><a data-tag="' + item.name + '" href="#' + item.name + '">' + itemText + '</a></li>';
			}
			//当前频道被删除时
			if ((item.abbr || item.name) == self.config.currentLabel && !item.val) {
				//清空list并以"头条"重新请求
				location.hash = '#头条';
				self.config.currentLabel = '头条';
				delete self.config.listArray[currentLabel];
				emptyElement(self.eleData.sgList);
				self.moreList(true, false, undefined, '头条');
				self.eleData.container.style.minHeight = self.viewHeight + 'px';
				currentDeleted = true;
			}
		});
		$('.selected').innerHTML = str;
		if (currentDeleted) {
			$('.selected li').className = 'current';
		}
		//重新初始化iScroll
		setTimeout(function() {
			var myScroll = new IScroll('.labelChange', {
				eventPassthrough: true,
				scrollX: true,
				scrollY: false
			});
			self.labelHeight = $('.labelChange').offsetHeight;
		}, 200);
	},
	//渲染频道编辑页
	renderEdit: function() {
		var self = this;
		var eleData = self.eleData;
		var edit = eleData.edit;
		var sgEdit = edit.children[2];
		var container = eleData.container;
		removeClass(edit, 'sg-hide');
		emptyStyle(edit);
		edit.scrollIntoView();
		//TOFIX: 独立出方法, 多处用到
		container.className = 'sg-hide';
		container.style.height = self.viewHeight + 'px';
		var style = document.getElementsByTagName('style')[0];
		setTimeout(function() {
			style.innerText += '.sg-edit-group li{height: ' + sgEdit.querySelector('li').offsetWidth + 'px};';
		}, 200);
		[].slice.call($$('li', sgEdit)).forEach(function(item, idx) {
			if (editData[idx] && editData[idx].val) {
				item.className = 'sg-choose-label';
			}
		});
	},
	//渲染列表页
	renderList: function(obj, change, direction) {
		console.log(obj);
		var section = this.eleData.sgList;
		var self = this;
		if (obj.length) {
			var ul = document.createElement('ul'),
				tempStr = '';
			ul.className = 'article';
			var hasSibi = obj.some(function(item) {
				return item.type == 'sibi';
			});
			if (!hasSibi) {
				obj.push();
			}
			for (var i = 0; i < obj.length; i++) {
				var item = obj[i];
				var url = encodeURIComponent(item && item.url);
				var currentLabel = this.config.currentLabel;
				var currentTime = this.config.currentTime;
				if (!item) continue;
				var txt, img = item.images,
					firstImg = img && img[0];
				var tempImage = !!img;
				if (this.config.currentLabel == '笑话') {
					if (item.contents && item.contents.length) {
						img = item.contents[1] && item.contents[1].img;
						txt = item.contents[0].txt;
					}
					tempStr += '<li class="spe sg-joke"><h2 class="' + (img ? 'sg-img' : 'sg-text') + '">' + item.title + '</h2>' + (img ? '<div class="big"><img src="' + img.image + '" alt="' + item.title + '"/></div>' : '<p>' + (txt || '') + '</p>') + '</li>';
				} else if (item.style == 'joke') {
					var items = item.url_infos;
					tempStr += '<li class="spe sg-joke"><h3>轻松一刻</h3>';
					if (items && items.length) {
						items.forEach(function(item, idx) {
							tempStr += '<h2 class="sg-text">' + item.title + '</h2><p>' + item.content + '</p>';
						});
					}
					tempStr += '<div class="sg-more-joke">去查看更多笑话 <span>&gt;</span></div></li>';
				} else if (item.type == 'sibi') {
					sibi = item.sibi;
					sibi.pros_num = 20;
					sibi.cons_num = 80;
					sibi.pros_title = '没有爱的婚姻不值得留恋';
					sibi.cons_title = '婚姻是责任与爱无关';
					//过小时样式展示问题
					if (sibi.pros_num < 20) {
						sibi.pros_num = 20;
					}
					var isSibiLabel = this.config.currentLabel == '撕逼头条';
					if (isSibiLabel) {
						var isToday = (self.sibiDate(sibi.found_time) == self.sibiDate(self.config.currentTime));
						tempStr += '<li class="spe sg-sibi sg-sibi-list"><a href="#sibi?content=' + sibi.content + '">';
						if (isToday) {
							tempStr += '<div class="sg-sibi-current">今日撕逼</div>';
						} else{
							//tempStr += '<div class="sg-sibi-prev">往期回顾</div>';
						}
					} else {
						tempStr += '<li class="spe sg-sibi"><h3>今日撕逼</h3>';
					}
					tempStr += '<div class="big"><img src="' + sibi.image + '" alt="' + sibi.title + '"><div class="caption">' + sibi.name + '</div></div><div class="sg-chart sg-chart-mini"><div class="pros"></div></div><div class="opposition"><div class="pros"><span>' + sibi.pros_title + '</span></div><div class="cons"><span>' + sibi.cons_title + '</span></div></div>';
					tempStr += '</a>' + (isToday && isSibiLabel)? '<div class="sg-sibi-prev">往期回顾</div>':'' + '</li>';
				} else if (!tempImage) { //无图
					tempStr += '<li class="spe"><a href=#article?s=' + url + '&label=' + currentLabel + '>' + '<h2 class="' + (tempImage ? '' : 'long-line') + '">' + item.title + '</h2><span class="count spe">' + (item.type ? '<i class="type ' + item.type + '">' + this.keyWord[item.type] + '</i>' : '') + (item.source ? ('<i class="source">' + item.source + '</i>') : '') + '<i class="time">' + (item.publish_time ? this.timeFormat(currentTime - item.publish_time * 1000) : '') + '</i></span></a></li>';
				} else if (item.style == 'three') { //三图平均
					tempStr += '<li class="spe"> <a href=#article?s=' + url + '&label=' + currentLabel + '> ' + (tempImage ? (' <div class="three"> <ul> <li style="background: rgb(224, 224, 224) url(./public/img/default.png) no-repeat center center;background-size: 35px 30px;" data-src="' + firstImg.name + '"></li> <li style="background: rgb(224, 224, 224) url(./public/img/default.png) no-repeat center center;background-size: 35px 30px;" data-src="' + img[1].name + '"></li> <li style="background: rgb(224, 224, 224) url(./public/img/default.png) no-repeat center center;background-size: 35px 30px;" data-src="' + img[2].name + '"></li> </ul> </div> ') : '') + ' <h2 class="' + (tempImage ? '' : 'long-line') + '">' + item.title + '</h2> <span class="count spe"> ' + (item.type ? ' <i class="type ' + item.type + '">' + this.keyWord[item.type] + '</i> ' : '') + (item.source ? (' <i class="source">' + item.source + '</i> ') : '') + ' <i class="time"> ' + (item.publish_time ? this.timeFormat(currentTime - item.publish_time * 1000) : '') + ' </i> </span> </a> </li>';
				} else if (item.style == 'big') { //大图
					tempStr += '<li class="spe"> <a href=#article?s=' + url + '&label=' + currentLabel + '> ' + (tempImage ? (' <div class="big"> <img class="' + (firstImg.width > firstImg.height ? "widthImg" : "heightImg") + '" src="' + img[0].name + '" alt="' + item.title + '"> </div> ') : '') + ' <h2 class="' + (tempImage ? '' : 'long-line') + '">' + item.title + '</h2> <span class="count spe"> ' + (item.type ? ' <i class="type ' + item.type + '">' + this.keyWord[item.type] + '</i> ' : '') + (item.source ? (' <i class="source">' + item.source + '</i> ') : '') + ' <i class="time"> ' + (item.publish_time ? this.timeFormat(currentTime - item.publish_time * 1000) : '') + ' </i> </span> </a> </li>';
				} else if (currentLabel == '美女') {
					tempStr += '<li class="spe sg-girl"><h2 class="' + (tempImage ? '' : 'long-line') + '">' + item.title + '</h2><div class="big"><img class="' + (firstImg.width > firstImg.height ? "widthImg" : "heightImg") + '" src="' + img[0].name + '" alt="' + item.title + '"></div></li>';
				} else {
					tempStr += '<li> <a href=#article?s=' + url + '&label=' + currentLabel + '> ' + (tempImage ? (' <div class="thumb" style="background: rgb(224, 224, 224) url(./public/img/default.png) no-repeat center center;background-size: 35px 30px;" data-src="' + firstImg.name + '"></div> ') : '') + ' <h2 class="' + (tempImage ? '' : 'long-line') + '">' + item.title + '</h2> <span class="count"> ' + (item.type ? ' <i class="type ' + item.type + '">' + this.keyWord[item.type] + '</i> ' : '') + (item.source ? (' <i class="source">' + item.source + '</i> ') : '') + ' <i class="time">' + (item.publish_time ? this.timeFormat(currentTime - item.publish_time * 1000) : '') + '</i> </span> </a> </li>';
				}
			}
			ul.innerHTML = tempStr;
			setTimeout(function() {
				var images = $$('.thumb', ul);
				for (var i = 0, l = images.length; i < l; i++) {
					if (!images[i].dataset) continue;
					(function(img, id) {
						var src = img.dataset.src;
						if (src) {
							imageLoaderManager.load(src, function(flag) {
								imageLoaderHelper(flag, img, id, src);
							});
						}
					})(images[i], 'news');
				}
				var imagesThree = $$('.three li', ul);
				if (imagesThree.length) {
					for (var i = 0, l = images.length; i < l; i++) {
						if (!(imagesThree[i] && imagesThree[i].dataset)) continue;
						(function(img, id) {
							var src = img.dataset.src;
							if (src) {
								imageLoaderManager.load(src, function(flag) {
									imageLoaderHelper(flag, img, id, src);
								});
							}
						})(imagesThree[i], 'news');
					}
				}
			}, 50);
			change && emptyElement(section);
			direction ? section.insertBefore(ul, section.children[0]) : section.appendChild(ul);
			$('.load-more').innerHTML = '<span>正在加载...</span>';
		}
	},
	//初始化详情请求
	renderArticle: function() {
		this.articleTime = new Date().getTime();
		var baseUrl = 'http://10.134.24.229/discover_agent?h=' + this.uuid + '&cmd=getcontent&phone=1&url=';
		this.createScript(baseUrl + location.hash.match(/http.*/)[0] + '&callback=renderArticleCallback');
	},
	//清空article
	initArticle: function(){

	},
	//从当前列表页请求更多内容
	moreList: function(change, direction, num, label) {
		var config = this.config;
		var index;
		var isJoke = '';
		var label1 = decodeURIComponent(config.currentLabel) == '撕逼头条' ? '撕逼' : decodeURIComponent(config.currentLabel);
		currentLabel = label || label1;
		this.listTime = new Date().getTime();
		url = num ? config.baseUrl.replace(/count=20/, 'count=' + num) : config.baseUrl;
		if (currentLabel == '头条') {
			index = config.listArray[config.currentLabel].data && config.listArray[config.currentLabel].data.length;
			//头条里是否插入笑话
			if (editData[6].val) {
				isJoke = '&f=j';
			}
		} else {
			index = this.getLastIndex(config.direction)[0];
		}
		this.createScript(url + index + '&b=' + currentLabel + '&mode=' + (direction ? 'up' : 'down') + '&t=' + this.getLastIndex(direction)[1] + isJoke + '&callback=renderListCallback');
	},
	renderListCallback: function(data) {
		var opeInfo = this.opeInfo;
		var config = this.config;
		var urls;
		//TOFIX: 数据请求失败情况
		try {
			urls = data.app_cmd[0].cmd[0].user_recomm_info[0].url_infos;
			this.pingback('listAllUrl', this.uuid, {
				time: new Date().getTime() - this.listTime,
				currentLabel: config.currentLabel
			});
		} catch (e) {
			//TOFIX: 无数据特殊处理; 两种情况, 上拉或者下拉无数据返回(暂无新数据或没有更多咯)
			emptyStyle($('#pulldown-msg'));
			emptyStyle(this.eleData.sgList);
			return this.showUp(0);
		}
		currentLabelList = config.listArray[config.currentLabel] || {};
		currentLabelList.data = currentLabelList.data || [];
		if (!data.app_cmd[0].cmd[0].user_recomm_info[0]) {
			$('.load-more').innerHTML = '<span>童鞋,表淘气,没有更多咯^_^</span>';
			return;
		}
		if (typeof urls.length == "number") {
			config.currentTime = (+data.timestamp) * 1000;
			this.renderList(urls, opeInfo.change, opeInfo.direction);
			if (opeInfo.direction) {
				this.showUp(opeInfo.num);
				this.pullDownStyle();
				//下拉, 下拉用不同的方法
				currentLabelList.data.unshift(urls);
				//TODO: 保存每个频道最新的时间
			} else {
				currentLabelList.data.push(urls);
			}
			currentLabelList.time = config.currentTime;
		}
	},
	renderArticleCallback: function(data) {
		var self = this;
		var config = self.config;
		var eleData = self.eleData;
		var article = eleData.article;
		var articleContainer = eleData.articleContainer;
		config.currentTime = (+data.timestamp) * 1000;
		//TOFIX: data需要特殊处理(安全考虑)
		data = data.app_cmd[0].cmd[0].news_app_info[0].url_info[0];
		this.url = data.url;
		//文章访问pingback
		this.pingback('article', this.uuid, {
			iconType: config.iconType,
			currentLabel: config.currentLabel,
			status: data.content ? 1 : 0,
			url: data.url,
			time: new Date().getTime() - this.articleTime
		});
		if (!data.content) {
			return articleContainer.innerHTML = '<div class="get-fail"> 矮油，文章不存在，返回继续看</div>';
		}
		//1.列表页进入, 2.当前页刷新
		var dateFormated = data.publish_time ? '<span class="time">' + this.dateFormat(data.publish_time * 1000) + '</span>' : '';
		if (!articleContainer.innerHTML) {
			articleContainer.innerHTML += '<h1>' + data.title + '</h1>' + '<h2><span class="source">' + data.source + '</span>' + dateFormated + '</h2>';
		} else {
			articleContainer.querySelector('.time') && (articleContainer.querySelector('.time').outerHTML = dateFormated);
		}
		articleContainer.innerHTML += '<div class="sg-content">' + data.content + '</div>';
		var allImg = articleContainer.querySelectorAll('img');
		allP = articleContainer.querySelectorAll('p');

		function getOrigin(url) {
			var a = document.createElement('a');
			a.href = url;
			return a.hostname;
		}
		var articleOrigin = location.hash.split('#article?=')[1];
		/*todo元素里的style属性*/
		for (var i = allImg.length - 1; i >= 0; i--) {
			var currentImg = allImg[i],
				alt = currentImg.getAttribute('alt'),
				next = currentImg.nextSbling,
				nextParent = currentImg.parentNode.nextSbling;
			currentImg.removeAttribute('width');
			currentImg.removeAttribute('height');
			currentImg.removeAttribute('style');
			if (alt && alt == (next && next.innerText)) {
				next.style.color = '#aaa';
			} else if (alt && alt == (nextParent && nextParent.innerText)) {
				nextParent.style.color = '#aaa';
			}
			//图片是相对路径
			if (currentImg.src.indexOf('/') == 0) {
				currentImg.src = getOrigin(articleOrigin) + currentImg.src;
			}
		}
		for (var i = allP.length - 1; i >= 0; i--) {
			var currentP = allP[i];
			var currentPContent = currentP.innerHTML.trim();
			if (currentPContent == '&nbsp;' || !currentPContent) {
				removeElement(currentP);
				continue;
			}
			currentP.innerHTML = currentPContent.replace(/&nbsp;/ig, '');
		}
		//移除iframe
		[].slice.call(article.querySelectorAll('iframe')).forEach(function(item) {
			removeElement(item);
		});
		emptyStyle(articleContainer);
		removeClass(article, 'sg-hide');
		$('title').innerText = data.title.trim().replace(/&nbsp;/g, '');
	},
	channelChange: function(channel) {
		var label = $('[data-tag=' + channel + ']');
		var self = this;
		var opeInfo = self.opeInfo;
		var config = self.config;
		opeInfo.change = true;
		opeInfo.direction = false;
		opeInfo.num = 0;
		emptyElement($('.load-more'));
		$('.selected .current') && ($('.selected .current').className = '');
		emptyElement(self.eleData.sgList);
		label.parentNode.className = 'current';
		label.scrollIntoView();
		history.pushState({
			page: channel
		}, undefined, 'http://' + location.host + '/#' + channel);
		config.currentLabel = channel.toLowerCase();
		config.listArray[config.currentLabel] = config.listArray[config.currentLabel] || {};
		currentLabelList = config.listArray[config.currentLabel];
		if (currentLabelList.length) { //已缓存
			var renderObj = currentLabelList[0].length < 10 ? currentLabelList[0].concat(currentLabelList[1]) : currentLabelList[0];
			self.renderList(renderObj, true);
		} else {
			self.moreList(true);
		}
	},
	init: function() {
		var self = this;
		var eleData = self.eleData;
		var container = eleData.container;
		var articleContainer = eleData.articleContainer;
		var article = eleData.article;
		var edit = eleData.edit;
		var opeInfo = self.opeInfo;
		var config = self.config;
		editData = localStorage.getItem('itemChoose') ? JSON.parse(localStorage.getItem('itemChoose')) : editData;
		self.startTime = new Date().getTime(); //停留时间
		self.renderSelected();
		self.viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
		self.viewWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
		setStyleEle(); //得到屏幕宽高
		container.style.minHeight = self.viewHeight + 'px';
		if ((location.hash.length && location.hash.slice(1))) {
			if (location.hash.length) {
				var lable = decodeURIComponent(~location.hash.indexOf('&label=') ? location.hash.slice(1).match(/label=(.*)(&|\s|\n)?/) && location.hash.slice(1).match(/label=(.*)(&|\s|\n)?/)[1] : location.hash.slice(1));
			}
			config.listArray[lable] = {};
			$('[href="#' + lable + '"]') && ($('[href="#' + lable + '"]').parentNode.className = 'current');
		} else {
			config.listArray["头条"] = {};
			$('.selected li') && ($('.selected li').className = 'current');
		}
		if (location.href.match(/hid=(.*?(?=(&|\n)))/)) {
			//self.uuid = url.match(/hid=(.*?($|(?=&))/)[1];
		} else {
			self.uuid = localStorage.getItem('uuid');
		}
		if (!self.uuid) {
			localStorage.setItem('uuid', self.uuid = self.guid());
		}
		self.config.baseUrl = 'http://10.134.24.229/discover_agent?h=' + self.uuid + '&cmd=getlist&phone=1&count=20&lastindex='
		if (~location.href.indexOf('#article?s=')) {
			self.renderArticle();
			self.layerSwitch($('#article'), $('#container'));
		} else if(~location.href.indexOf('#sibi?content')){
			self.getsibi();
			self.layerSwitch($('#article'), $('#container'));
		} else {
			localStorage.setItem('info', '');
			self.moreList();
		}
		self.pingback('init', self.uuid, {
			iconType: self.config.iconType,
			currentLabel: self.config.currentLabel
		});
		$('#sg-edit-text').addEventListener('click', function(e) {
			self.renderEdit();
		});
		$('.labelChange') && $('.labelChange').addEventListener('click', function(e) {
			var label = e.target.parentNode,
				selected = $('.selected');
			if (label.nodeName !== 'LI') return; //切内容
			opeInfo.change = true;
			opeInfo.direction = false;
			opeInfo.num = 0;
			emptyElement($('.load-more'));
			$('.selected .current') && ($('.selected .current').className = '');
			emptyElement(self.eleData.sgList);
			label.scrollIntoView();
			config.currentLabel = e.target.getAttribute("data-tag").toLowerCase();
			config.listArray[config.currentLabel] = config.listArray[config.currentLabel] || {};
			currentLabelList = config.listArray[config.currentLabel] && config.listArray[config.currentLabel].data;
			if (!(currentLabelList && currentLabelList.length)) {
				self.moreList(true);
			} else if (config.currentTime - config.listArray[config.currentLabel].time > 60 * 3 * 1000) { //时间超三分钟
				self.getUpdate(self.config.currentLabel, self.getLastIndex(true)[0]);
			} else {
				var renderObj = currentLabelList[0].length < 20 ? currentLabelList[0].concat(currentLabelList[1]) : currentLabelList[0];
				self.renderList(renderObj, true);
			}
			if (!e.oldURL) document.body.scrollTop = 0;
			label.className += 'current';
			setTimeout(function() {
				self.pingback('list', self.uuid, {
					iconType: self.config.iconType,
					currentLabel: self.config.currentLabel
				});
			}, 50);
		});
		$('.sg-turn-back') && $('.sg-turn-back').addEventListener('click', function(e) {
			e.target.style.backgroundPosition = '0 0';
			history.back();
			// 安卓回退接口
			window.Activity && window.Activity.closeWebActivity && window.Activity.closeWebActivity();
		});
		article && article.addEventListener('scroll', function(e) {
			if (article.scrollTop + article.offsetHeight / 4 * 5 > article.children[0].offsetHeight) {
				if (!self.readed) {
					self.pingback('articleReaded', self.uuid, {
						currentLabel: self.config.currentLabel,
						url: self.url
					});
					self.readed = true;
				}
			}
		});
		$('.load-more') && window.addEventListener('scroll', function(e) {
			self.scrollUpdateDelay.call(self, e);
		});
		$('#toTop') && $('#toTop').addEventListener('touchstart', function(e) {
			document.body.scrollTop = 0;
		});
		//todo
		window.onbeforeunload = function() {
			self.pingback("end", self.uuid, {
				time: +new Date().getTime() - (+self.startTime)
			});
		};
		self.dbody.addEventListener('click', function(e) {
			var target = e.target;
			var targetParent = target.parentNode;
			var photoMask = $('#photo-mask');
			var photoDownLoad = $('.sg-download');
			var ifMask = $('.sg-girl') || $('.sg-joke');
			if (target.className == 'sg-return') {
				history.back();
			}
			if(targetParent.parentNode.className == 'spe sg-sibi' || targetParent.parentNode.className == 'spe sg-sibi') {
				self.channelChange('撕逼头条');
			} else if (ifMask && target.tagName == 'IMG') {
				$('#photo-mask img') && removeElement($('#photo-mask img'));
				photoMask.classList.toggle('sg-hide');
				var newImage = target.cloneNode(true);
				if (target.naturalHeight > window.innerHeight && target.naturalHeight / target.naturalWidth > window.innerHeight / window.innerWidth) {
					newImage.style.bottom = 'auto';
				}
				photoMask.appendChild(newImage);
			}
			if (target.className == 'sg-more-joke') {
				self.channelChange('笑话');
			}
		});

		function articleRenderSet() {
			var viewHeight = self.viewHeight;
			//删除多余图片
			if ($$('.big', article)) {
				[].slice.call($$('.big', articleContainer)).forEach(function(item) {
					removeElement(item);
				});
			}
			setTimeout(function() {
				container.className += ' noScroll sg-hide';
			}, 0);
			setTimeout(function() {
				if ($('.default-loading')) {
					removeElement($('.default-loading'));
					(articleContainer.innerHTML += '<div class="get-fail"> 矮油，文章不存在，点击返回继续看吧</div>');
				}
				self.pingback('article', self.uuid, {
					iconType: config.iconType,
					currentLabel: config.currentLabel,
					status: 0,
					url: self.url
				});
			}, 2000);
			!(articleContainer.children[3] && articleContainer.children[3].innerHTML) && self.renderArticle();
		}
		window.addEventListener('hashchange', function(e) {
			var viewHeight = self.viewHeight;
			var isArticle = !!~e.newURL.indexOf('#article?s');
			var isSibi = !!~e.newURL.indexOf('#sibi?content');
			if (isArticle || isSibi) {
				//TOFIX: 第一眼所花时间过长
				article.style.cssText = 'height:100%;min-height:' + viewHeight + 'px;padding: 0;z-index: 100;';
				articleContainer.style.minHeight = viewHeight + 'px';
				if (isArticle) {
					self.articleStartTime = new Date().getTime();
					self.readed = false;
				}
				//edit.style.height = viewHeight + 'px';
				self.scrollTop = document.body.scrollTop;
				for (var i = $$('.article a').length - 1; i >= 0; i--) {
					if (encodeURIComponent($$('.article a')[i].href) == encodeURIComponent(e.newURL)) {
						var currentTag = $$('.article a')[i];
						currentTag.className = 'visitedLink';
						var cloneTarget = isArticle ? currentTag.children[0] : currentTag.children[1];
						if (cloneTarget.className == 'big' && !article.querySelector('big')) {
							//TODO: add big picture
							article.children[0].insertBefore(cloneTarget.cloneNode(true), articleContainer);
							isArticle && ($('.big img', article).style.maxWidth = '200%');
						}
						if (isArticle) articleContainer.innerHTML = '</span><h1><span>' + currentTag.querySelector('h2').innerText + '</span></h1><h2>' + (currentTag.querySelector('.source') ? '<span class="source">' + currentTag.querySelector('.source').innerText + '</span>' : '') + '<span class="time"></span></h2>';
					}
				}
				isArticle && articleRenderSet();
				isSibi && self.getsibi(location.hash.split('=')[1]);
				article.scrollIntoView();
			} else {
				if (~e.oldURL.indexOf('#article?s') || ~e.oldURL.indexOf('#sibi?content')) {
					e.preventDefault(), e.stopPropagation();
					removeClass(container, 'noScroll');
					emptyStyle(container);
					removeClass(container, 'sg-hide');
					document.body.scrollTop = self.scrollTop;
					// setTimeout(function() {
					// 	document.body.scrollTop = self.scrollTop;
					// }, 0);
					addClass(article, 'sg-hide');
					emptyStyle(article);
					emptyElement(articleContainer);
					$('title').innerText = location.href;
					self.pingback('readTime', self.uuid, {
						iconType: self.config.iconType,
						url: self.url,
						time: +new Date().getTime() - (+self.articleStartTime)
					});
					if (!$('.sg-list').textContent) {
						self.moreList(true, false, undefined, '头条');
						self.eleData.container.minHeight = self.viewHeight + 'px';
					}
					if (article.children[0].className == 'big') {
						article.removeChild(article.children[0]);
					}
				}
			}
		});
		self.dbody.addEventListener('touchstart', function(e) {
			if (self.dbody.scrollTop == 0) {
				toTopDistance = 0;
			}
		});
		self.pullToRefresh.init.call(self);
		//选取事件
		var sgEdit = $('.sg-edit-group');
		sgEdit.addEventListener('click', function(e) {
			var target = e.target;
			var tagName = target.tagName;
			var goalEle, index;
			var assignParentNode = target.parentNode.parentNode;
			goalEle = tagName !== 'I' ? assignParentNode.parentNode : assignParentNode;
			index = [].slice.call(goalEle.parentNode.children).indexOf(goalEle);
			if (0 == index || 1 == index) return;
			goalEle.classList.toggle('sg-choose-label');
			editData[index].val = !editData[index].val;
			//TOFIX: 避免频繁操作localStorage
			localStorage.setItem('itemChoose', JSON.stringify(editData));
		});
		$('#sg-edit-finish').addEventListener('click', function(e) {
			container.className = '';
			addClass(edit, 'sg-hide');
			emptyElement($('.load-more'));
			self.renderSelected();
		}, false);
	},
	scrollTime: new Date().getTime(),
	scrollUpdate: function(e) {
		var scrollTop = this.dbody.scrollTop;
		var opeInfo = this.opeInfo;
		var time = new Date().getTime();
		if (time - this.scrollTime < 500) return;
		if (scrollTop + window.innerHeight + 20 > this.eleData.sgList.clientHeight) {
			opeInfo.change = false;
			opeInfo.direction = false;
			opeInfo.num = 0;
			this.moreList(false);
		}
		this.scrollTime = new Date().getTime();
		$('#toTop').style.display = scrollTop > 800 ? 'block' : 'none';
	},
	scrollUpdateDelay: function(e) {
		var self = this;
		if ($('#photo-mask').className == '') {
			e.preventDefault && e.preventDefault();
			e.returnValue = false;
			e.stopPropagation && e.stopPropagation();
			return false;
		}
		if (self.eleData.container.className == '') {
			setTimeout(function() {
				self.scrollUpdate(e);
			}, 300);
			//头部定位
			var labelChange = $('.labelChange');
			labelChange.style.position = self.dbody.scrollTop > 50 ? 'fixed' : 'absolute';
			if (self.dbody.scrollTop > 50) {
				labelChange.style.position = 'fixed';
				labelChange.style.top = 0;
			} else if (self.dbody.scrollTop > 43) {
				labelChange.style.top = '-70px';
			} else {
				labelChange.style.top = 0;
				labelChange.style.position = 'absolute';
			}
		}
	},
	showUp: function(num) {
		var callbackMsg = $('#callback-msg');
		num = num > 10 ? 10 : num;
		if(num == 0) {
			emptyElement($('.load-more'));
		}
		callbackMsg.innerText = arguments[0] ? '为您推荐' + num + '篇文章' : '暂无新推荐';
		setTimeout(function() {
			callbackMsg.style.opacity = '1';
		}, 500);
		setTimeout(function() {
			callbackMsg.style.opacity = '0';
			setTimeout(function() {
				callbackMsg.innerText = '暂无新推荐';
			}, 500);
		}, 1500);
	},
	getUpdate: function(currentLabel, lastindex) {
		var baseUrl = 'http://10.134.24.229/discover_agent?h=' + this.uuid + '&cmd=getupdatenumber&phone=1&b=' + currentLabel + '&lastindex=' + lastindex + '&callback=updateGeted';
		this.createScript(baseUrl);
	},
	pullDownStyle: function() {
		//setTimeout里的调用
		globalObj.eleData.sgList.style.cssText = '-webkit-transition: all .3s ease;transition: all .3s ease;-webkit-transform: translate3d(0, 0, 0);transform: translate3d(0, 0, 0)';
		$('#pulldown-msg').style.cssText = '-webkit-transition: all .3s ease;transition: all .3s ease;-webkit-transform: translate3d(0, 0, 0);transform: translate3d(0, 0, 0)';
		removeClass($('#pulldown-msg i'), 'icon-refresh');
	},
	updateGeted: function(data) {
		console.trace();
		var opeInfo = this.opeInfo;
		data = data.app_cmd[0].cmd[0].news_app_info && data.app_cmd[0].cmd[0].news_app_info[0];
		if (data && data.update_number) {
			opeInfo.change = false;
			opeInfo.direction = true;
			opeInfo.num = data.update_number;
			var refreshNum = data.update_number > 10 ? 10 : data.update_number;
			this.moreList(false, true, refreshNum);
		} else {
			this.pingback('updateFail', this.uuid, {
				currentLabel: this.config.currentLabel
			});
			this.showUp(0);
			setTimeout(this.pullDownStyle, 300);
		}
		this.toGetUpdate = false;
	},
	getLastIndex: function(bool) { //true时取最大值
		//注意, 这里是引用值, 直接用slice会改变原有对象
		var currentList = JSON.parse(JSON.stringify(this.config.listArray[this.config.currentLabel].data || ({})));
		if (currentList.length) {
			var currentItem = bool ? currentList.shift().shift() : currentList.pop().pop();
			return [currentItem.index, currentItem.publish_time];
		} else {
			return [undefined, 0];
		}
	},
	pullToRefresh: {
		init: function() {
			var self = this,
				eleData = self.eleData,
				sgList = eleData.sgList,
				pulldownMsg = $('#pulldown-msg'),
				container = eleData.container,
				pulldownMsgIcon = $('#pulldown-msg i'),
				pulldownMsgText = $('#pulldown-msg span');

			function allowToPull(e) {
				return document.body.scrollTop == 0 && (e.target.parentNode.nodeName !== 'LI' || !e.target.hasAttribute('data-tag'));
			}
			container.addEventListener('touchstart', function(e) {
				touchY = e.touches[0].pageY;
			});
			container.addEventListener('touchmove', function(e) {
				if (self.config.currentLabel == '撕逼头条') return;
				var pageY = e.touches[0].pageY;
				if (allowToPull(e)) {
					if (pageY - touchY > 100) {
						return void 0;
					}
					pageY - touchY > 0 && e.preventDefault();
					sgList.style.cssText = 'transition: none;-webkit-transition: none';
					(pageY - touchY > 0) && (sgList.style.cssText += 'transform:translate3d(0, ' + (pageY - touchY) + ' px,0);-webkit-transform: translate3d(0, ' + (pageY - touchY) + 'px,0)');
					pulldownMsg.style.cssText = '-webkit-transition: none;transition: none;transform: translate3d(0, ' + (pageY - touchY) + 'px,0); -webkit-transform: translate3d(0, ' + (pageY - touchY) + 'px,0);';
					if (pageY - touchY > 60) {
						self.toGetUpdate = true;
						addClass(pulldownMsgIcon, 'icon-arrow-up');
						pulldownMsgText.innerText = '放开即可推荐'
					} else {
						removeClass(pulldownMsgIcon, 'icon-arrow-up');
						pulldownMsgText.innerText = '下拉刷新';
					}
				}
				if (!$('.sg-mask.sg-hide')) {
					e.preventDefault();
					return false;
				}
			});
			container.addEventListener('touchend', function(e) {
				if (self.config.currentLabel == '撕逼头条') return;
				var opeInfo = self.opeInfo;
				if (allowToPull(e)) {
					opeInfo.change = false;
					opeInfo.direction = true;
					opeInfo.num = 0;
					if (!self.toGetUpdate) {
						self.pullDownStyle();
					} else {
						pulldownMsgText.innerText = '正在推荐';
						addClass(pulldownMsgIcon, 'icon-refresh');
						self.getUpdate(self.config.currentLabel, self.getLastIndex(true)[0]);
						self.pingback('update', self.uuid, {
							currentLabel: self.config.currentLabel
						});
					}
				}
			});
		}
	}
};

globalObj.init();