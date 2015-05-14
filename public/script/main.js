/*//artTtemplate配置
template.config('escape', false);
template.config('compress', true);

//列表渲染函数
var listRender = template.compile(' {{each list}} <li class="{{$value.style}}"> <a href="#article?s={{encodeURIComponent($value.url)}}&label={{globalObj.config.currentLabel}}"> {{if $value.images}} {{if $value.style == "big"}} <div class="big"> <img class="{{$value.images[0].width > $value.images[0].height ? "widthImg" : "heightImg"}}" src="{{$value.images[0].name}}" alt="{{$value.title}}"> </div> {{/if}} {{if $value.style == "three"}} <div class="three"> <ul> <li style="background: rgb(224, 224, 224) url(img/default.png) no-repeat center center;background-size: 35px 30px;" data-src="{{$value.images[0]}}"></li> <li style="background: rgb(224, 224, 224) url(img/default.png) no-repeat center center;background-size: 35px 30px;" data-src="{{$value.images[1]}}"></li> <li style="background: rgb(224, 224, 224) url(img/default.png) no-repeat center center;background-size: 35px 30px;" data-src="{{$value.images[2]}}"></li> </ul> </div> {{/if}} {{/if}} <h2 class="{{if !$value.images}}long-line{{/if}}">{{$value.title}}</h2> <span class="count spe"> {{if $value.type}} <i class="type {{$value.type}}">{{globalObj.keyWord[$value.type]}}</i> {{/if}} {{if $value.source}} <i class="source">{{$value.source}}</i> {{/if}} {{if $value.publish_time}} <i class="source"> {{globalObj.timeFormat(globalObj.config.currentTime - $value.publish_time * 1000)}} </i> {{/if}} </span> </a> </li> {{/each}}');
listRender({
	globalObj: globalObj,
	list: a.app_cmd[0].cmd[0].user_recomm_info[0].url_infos
});
*/


//http://discover.ie.sogou.com/discover_agent?h=8ea3f681-58ab-1f4b-0c9f-eeeec1bce883&cmd=getlist&phone=1&count=20&lastindex=undefined&b=%E5%A4%B4%E6%9D%A1&mode=down&t=0&callback=renderListCallback
//http://discover.ie.sogou.com/discover_agent?h=4b950c35-6828-928f-4e39-9b76b78597bd&cmd=getlist&phone=1&count=20&lastindex=0&b=%E5%A4%B4%E6%9D%A1&mode=down&t=0&callback=renderListCallback


//根据json渲染editer
function renderEdit(){

}

//TODO: 第一次进频道或者下拉刷新时, 或者频道过期后再切回来, 都显示更新数量
function showNewsNum(num){
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
	'news': './images/default-news.png'
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
	guid: (function() {//生成uuid
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
	createScript: function(url) {//jsonp
		var script = document.createElement('script');
		script.src = url;
		this.dbody.appendChild(script);
		setTimeout(function() {
			removeElement(script);
		}, 5000);
	},
	config: {
		//当前时间(服务器时间)
		currentTime: 0,
		//当前频道
		currentLabel: decodeURIComponent(~location.hash.indexOf('&label=') ? location.hash.slice(1).match(/label=(.*)[&\s\n]?/) && location.hash.slice(1).match(/label=(.*)[&\s\n]?/)[1] : location.hash.slice(1)) || '头条',
		iconType: location.href.match(/iconType=([a-zA-Z0-9]*)/) && location.href.match(/iconType=([a-zA-Z0-9]*)/)[1],
		//每个频道的内容及频道最后一次请求新数据的时间
		listArray: {}
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
		var date = dateForm(time.getDate() - 1, true);//日期减1
		var month = dateForm(time.getMonth() + 1);//月份加1
		var hour = dateForm(time.getHours());
		var minute = dateForm(time.getMinutes());
		function dateForm(item, bool) {
			item = item + (bool ? 1 : '') + '';
			item = item.length < 2 ? '0' + item : item;
			return item;
		}
		return month + '-' + date + '  ' + hour + ':' + minute;
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
		if(currentDeleted) {
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
			if (editData[idx].val) {
				item.className = 'sg-choose-label';
			}
		});
	},
	//渲染列表页
	renderList: function(obj, change, direction) {
		var section = this.eleData.sgList;
		if (obj.length) {
			var ul = document.createElement('ul'),
				tempStr = '';
			ul.className = 'article';
			for (var i = 0; i < obj.length; i++) {
				var item = obj[i];
				if (!item) continue;
				var img = item.images, 
					firstImg = img && img[0];
				var tempImage = !!img;
				if (!tempImage) { //无图
					tempStr += '<li class="spe"><a href=#article?s=' + encodeURIComponent(item.url) + '&label=' + this.config.currentLabel + '>' + '<h2 class="' + (tempImage ? '' : 'long-line') + '">' + item.title + '</h2><span class="count spe">' + (item.type ? '<i class="type ' + item.type + '">' + this.keyWord[item.type] + '</i>' : '') + (item.source ? ('<i class="source">' + item.source + '</i>') : '') + '<i class="time">' + (item.publish_time ? this.timeFormat(this.config.currentTime - item.publish_time * 1000) : '') + '</i></span></a></li>';
				} else if (item.style == 'three') { //三图平均
					tempStr += '<li class="spe"> <a href=#article?s=' + encodeURIComponent(item.url) + '&label=' + this.config.currentLabel + '> ' + (tempImage ? (' <div class="three"> <ul> <li style="background: rgb(224, 224, 224) url(img/default.png) no-repeat center center;background-size: 35px 30px;" data-src="' + firstImg.name + '"></li> <li style="background: rgb(224, 224, 224) url(img/default.png) no-repeat center center;background-size: 35px 30px;" data-src="' + img[1].name + '"></li> <li style="background: rgb(224, 224, 224) url(img/default.png) no-repeat center center;background-size: 35px 30px;" data-src="' + img[2].name + '"></li> </ul> </div> ') : '') + ' <h2 class="' + (tempImage ? '' : 'long-line') + '">' + item.title + '</h2> <span class="count spe"> ' + (item.type ? ' <i class="type ' + item.type + '">' + this.keyWord[item.type] + '</i> ' : '') + (item.source ? (' <i class="source">' + item.source + '</i> ') : '') + ' <i class="time"> ' + (item.publish_time ? this.timeFormat(this.config.currentTime - item.publish_time * 1000) : '') + ' </i> </span> </a> </li>';
				} else if (item.style == 'big') { //大图
					tempStr += '<li class="spe"> <a href=#article?s=' + encodeURIComponent(item.url) + '&label=' + this.config.currentLabel + '> ' + (tempImage ? (' <div class="big"> <img class="' + (firstImg.width > firstImg.height ? "widthImg" : "heightImg") + '" src="' + img[0].name + '" alt="' + item.title + '"> </div> ') : '') + ' <h2 class="' + (tempImage ? '' : 'long-line') + '">' + item.title + '</h2> <span class="count spe"> ' + (item.type ? ' <i class="type ' + item.type + '">' + this.keyWord[item.type] + '</i> ' : '') + (item.source ? (' <i class="source">' + item.source + '</i> ') : '') + ' <i class="time"> ' + (item.publish_time ? this.timeFormat(this.config.currentTime - item.publish_time * 1000) : '') + ' </i> </span> </a> </li>';
				} else if(this.config.currentLabel == '美女') {
					tempStr += '<li class="spe"><h2 class="' + (tempImage ? '' : 'long-line') + '">' + item.title + '</h2><div class="big"><img class="' + (firstImg.width >firstImg.height ? "widthImg" : "heightImg") + '" src="' + img[0].name + '" alt="' + item.title + '"></div></li>';
				} else {
					tempStr += '<li> <a href=#article?s=' + encodeURIComponent(item.url) + '&label=' + this.config.currentLabel + '> ' + (tempImage ? (' <div class="thumb" style="background: rgb(224, 224, 224) url(img/default.png) no-repeat center center;background-size: 35px 30px;" data-src="' + firstImg.name + '"></div> ') : '') + ' <h2 class="' + (tempImage ? '' : 'long-line') + '">' + item.title + '</h2> <span class="count"> ' + (item.type ? ' <i class="type ' + item.type + '">' + this.keyWord[item.type] + '</i> ' : '') + (item.source ? (' <i class="source">' + item.source + '</i> ') : '') + ' <i class="time">' + (item.publish_time ? this.timeFormat(this.config.currentTime - item.publish_time * 1000) : '') + '</i> </span> </a> </li>';
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
			this.dbody.touchstart && this.dbody.touchstart();
		}
	},
	//初始化详情请求
	renderArticle: function() {
		this.articleTime = new Date().getTime();
		var baseUrl = 'http://discover.ie.sogou.com/discover_agent?h=' + this.uuid + '&cmd=getcontent&phone=1&url=';
		this.createScript(baseUrl + location.hash.match(/http.*/)[0] + '&callback=renderArticleCallback');
	},
	//从当前列表页请求更多内容
	moreList: function(change, direction, num, label) {
		var config = this.config;
		var index;
		currentLabel = label || decodeURIComponent(config.currentLabel);
		this.listTime = new Date().getTime();
		url = num ? config.baseUrl.replace(/count=20/, 'count=' + num) : config.baseUrl;
		if (currentLabel == '头条') {
			index = config.listArray[config.currentLabel].data && config.listArray[config.currentLabel].data.length;
		} else {
			index = this.getLastIndex(!config.direction)[0];
		}
		this.createScript(url + index + '&b=' + currentLabel + '&mode=' + (direction ? 'up' : 'down') + '&t=' + this.getLastIndex(direction)[1] + '&callback=renderListCallback');
	},
	//
	renderListCallback: function(data) {
		var opeInfo = this.opeInfo;
		var config = this.config;
		var urls;
		//TOFIX: 数据请求失败情况
		try {
			urls = data.app_cmd[0].cmd[0].user_recomm_info[0].url_infos;
			this.pingback('listAllUrl', this.uuid, {
				// url: urls.map(function(item) {
				// 	return item.url;
				// }).join(),
				time: new Date().getTime() - this.listTime,
				currentLabel: config.currentLabel
			});
		} catch (e) {
			//TOFIX: 无数据特殊处理; 两种情况, 上拉或者下拉无数据返回(暂无新数据或没有更多咯)
			emptyStyle($('#pulldown-msg'));
			emptyStyle(this.eleData.sgList);
			return this.showUp(0);
		}
		currentLabelList = config.listArray[config.currentLabel]||{};
		currentLabelList.data = currentLabelList.data||[];
		if (data.app_cmd[0].cmd[0].user_recomm_info[0] + '' == 'null') {
			//alert('haha');
		}
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
				//保存每个频道最新的时间
				//currentLabelList.unshift(urls);
			} else {
				currentLabelList.data.push(urls);
				//currentLabelList.push(urls);
			}
			currentLabelList.time = config.currentTime;
			setTimeout(function() { //link列表存入本地
				info = {};
				info[config.currentLabel] = [];
				for (var i = 0; i < currentLabelList.data.length; i++) {
					var item = currentLabelList.data[i];
					for (var j = 0; j < item.length; j++) {
						info[config.currentLabel].push(item[j].url);
					}
				}
				localStorage.setItem('info', JSON.stringify(info));
			}, 0);
		}
	},
	renderArticleCallback: function(data) {
		var self = this;
		var config = self.config;
		var eleData = self.eleData;
		var article = eleData.article;
		var articleContainer = eleData.articleContainer;
		//container.parentNode.style.height = '100%';
		//articleContainer.scrollIntoView();
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
		//$('.default-loading') && removeElement($('.default-loading'));
		var allImg = articleContainer.querySelectorAll('img');
		allP = articleContainer.querySelectorAll('p');
		function getOrigin(url){
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
			if(currentImg.src.indexOf('/') == 0) {
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
		if('美女' == config.currentLabel) {
			$('.sg-list').classList.add('sg-girl');
		}
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
		self.config.baseUrl = 'http://discover.ie.sogou.com/discover_agent?h=' + self.uuid + '&cmd=getlist&phone=1&count=20&lastindex='
		if (!~location.href.indexOf('#article?s=')) {
			localStorage.setItem('info', '');
			self.moreList();
		} else {
			self.renderArticle();
			self.layerSwitch($('#article'), $('#container'));
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
			if('美女' == e.target.getAttribute('data-tag')) {
				$('.sg-list').classList.add('sg-girl');
			} else {
				$('.sg-list').className = 'sg-list';
			}
			//location.hash = e.target.getAttribute('data-tag');
			config.currentLabel = e.target.getAttribute("data-tag").toLowerCase();
			config.listArray[config.currentLabel] = config.listArray[config.currentLabel] || {};
			currentLabelList = config.listArray[config.currentLabel] && config.listArray[config.currentLabel].data;
			if (currentLabelList && currentLabelList.length) { //已缓存
				var renderObj = currentLabelList[0].length < 20 ? currentLabelList[0].concat(currentLabelList[1]) : currentLabelList[0];
				self.renderList(renderObj, true);
			} else {
				//TOFIX: 加一个缓冲层
				//self.listLoadingView();
				self.moreList(true); //未缓存
				//TODO: 返回数据后, 显示更新条数
				
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
		$('.load-more') && window.addEventListener('scroll', function() {
			self.scrollUpdateDelay.call(self);
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
		self.dbody.addEventListener('touchstart', function(e) {
			var target = e.target;
			if (target.className == 'sg-return') {
				history.back();
			}
		});
		self.dbody.addEventListener('click', function(e) {
			var target = e.target;
			if($('.sg-girl') && target.tagName == 'IMG') {
				$('#photo-mast').classList.toggle('sg-hide');
				$('#photo-mast').style.backgroundImage = 'url(' + target.src + ')';
				//$('#photo-mast').appendChild(target.clone(true));
				container.classList.toggle('noScroll');
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
			//articleContainer.innerHTML += '<div class="spinner"><div class="dot1"></div><div class="dot2"></div></div>';
			//container.style.height = viewHeight + 'px';
			setTimeout(function(){
				container.className += ' noScroll sg-hide';
				//articleContainer.style.minHeight = viewHeight + 'px';
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
			if (~e.newURL.indexOf('#article?s')) {
				//TOFIX: 第一眼所花时间过长
				article.style.cssText = 'height:100%;min-height:' + viewHeight + 'px;padding: 0;z-index: 100;';
				self.articleStartTime = new Date().getTime();
				self.readed = false;
				//edit.style.height = viewHeight + 'px';
				self.scrollTop = document.body.scrollTop;
				for (var i = $$('.article a').length - 1; i >= 0; i--) {
					if (encodeURIComponent($$('.article a')[i].href) == encodeURIComponent(e.newURL)) {
						var currentTag = $$('.article a')[i];
						currentTag.className = 'visitedLink';
						if (currentTag.children[0].className == 'big' && !article.querySelector('big')) {
							//article.insertBefore(currentTag.children[0].cloneNode(true), articleContainer);
							//$('.big img', article).style.maxWidth = '200%';
						}
						articleContainer.innerHTML = '</span><h1><span>' + currentTag.querySelector('h2').innerText + '</span></h1><h2>' + (currentTag.querySelector('.source') ? '<span class="source">' + currentTag.querySelector('.source').innerText + '</span>' : '') + '<span class="time"></span></h2>';
					}
				}
				articleRenderSet();
				article.scrollIntoView();
			} else {
				if (~e.oldURL.indexOf('#article?s')) {
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
			if (0 == index) return;
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
		var baseUrl = 'http://discover.ie.sogou.com/discover_agent?h=' + this.uuid + '&cmd=getupdatenumber&phone=1&b=' + currentLabel + '&lastindex=' + lastindex + '&callback=updateGeted';
		this.createScript(baseUrl);
	},
	pullDownStyle: function() {
		//setTimeout里的调用
		globalObj.eleData.sgList.style.cssText = '-webkit-transition: all .3s ease;transition: all .3s ease;-webkit-transform: translate3d(0, 0, 0);transform: translate3d(0, 0, 0)';
		$('#pulldown-msg').style.cssText = '-webkit-transition: all .3s ease;transition: all .3s ease;-webkit-transform: translate3d(0, 0, 0);transform: translate3d(0, 0, 0)';
		removeClass($('#pulldown-msg i'), 'icon-refresh');
	},
	updateGeted: function(data) {
		var opeInfo = this.opeInfo;
		data = data.app_cmd[0].cmd[0].news_app_info[0];
		if (data.update_number) {
			opeInfo.change = false;
			opeInfo.direction = true;
			opeInfo.num = data.update_number;
			var refreshNum = data.update_number > 10 ? 10 : data.update_number;
			this.moreList(false, true, refreshNum);
		} else {
			this.pingback('updateFail', this.uuid, {
				currentLabel: this.config.currentLabel
			});
			this.showUp();
			setTimeout(this.pullDownStyle, 300);
		}
		this.toGetUpdate = false;
	},
	getLastIndex: function(bool) { //true时取最大值
		//注意, 这里是引用值, 直接用slice会改变原有对象
		var currentList = JSON.parse(JSON.stringify(this.config.listArray[this.config.currentLabel].data||({})));
		if (currentList.length) {
			var currentItem = !bool ? currentList.shift().shift() : currentList.pop().pop();
			return [currentItem.index, currentItem.publish_time];
		} else {
			return [undefined, 0];
		}
	},
	pullToRefresh: {
		init: function() {
			var self = this,
				eleData = self.eleData
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