(function ($) {

    'use strict';

    var realDataInit = {

        initialize: function () {
            this
                .setVars()
                .build()
                .events();

            console.log('realData');
            showNav();
            return this;
        },

        setVars: function () {
            //日期
            var myDate = new Date();
            this.today = format(myDate, 'yyyy-MM-dd'); //今天
            this.yesterday = format((myDate - 86400000), 'yyyy-MM-dd');//昨天
            this.lastWeek = format((myDate - 86400000 * 7), 'yyyy-MM-dd');//上周
            this.interval = { chartmain: 11 }; //控制x轴的显示数据
            //折线图
            this.chartData = {
                xAxis: [],
                dates: []
            };

            //echarts 
            this.correspond = {
                list: ["myChart", "newPlayerCount"]
            };

            //echarts 颜色
            this.dateCorrespond = {};
            this.dateCorrespond[this.today] = { name: "今日", color: "#d2502f" };
            this.dateCorrespond[this.yesterday] = { name: "昨日", color: "#4fa8f9" };
            this.dateCorrespond[this.lastWeek] = { name: "上周", color: "#A4A4A4" };
            this.myChart = null;

            return this;
        },

        build: function () {
            var _self = this;
            //初始化折线图
            this.myChart = echarts.init(document.getElementById('chartmain'));
            this.ech(this.myChart);
            //产品名称下拉
            this.initProductSelect();
            return this;
        },

        events: function () {
            var _self = this;
            //产品名称联动一级渠道
            // $("#realData #product").change(function () {
            //     var gameID = $("#realData #product").val();
            //     if (gameID == "") {
            //         var content = "<option value=''>全部</option>";
            //         $("#realData #channel_one").html("").html(content);
            //         $("#realData #channel_one").next("div").remove();
            //         $('#realData #channel_one').searchableSelect();
            //         return false
            //     } else {
            //         _self.initChannel(gameID);
            //     }
            // });

            $("#realData #search").on('click', function () {
                var game_Id = $("#realData #product").val();
                var channelOne = $("#realData #channel_one").val();

                _self.fetchData([_self.today, _self.yesterday, _self.lastWeek]);
                _self.reloadTable();
            });

            return this;
        },

        //初始化产品名称下拉
        initProductSelect: function () {
            var _self = this;
            $.ajax({
                type: 'GET',
                url: config.path + "/channel/v1/product?t=" + Math.random(),
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                contentType: 'application/json;charset=utf-8',
                dataType: 'json',
                success: function (response) {
                    if (response.code == "0") {
                        var html = "";//"<option value=''>全部</option>";
                        response.data.forEach(function (element) {
                            html += "<option value='" + element.gameId + "'>" + element.gameName + "</option>"
                        });
                        $("#realData #product").html("").html(html);
                        $("#realData #product").next("div").remove();
                        $('#realData #product').searchableSelect({
                            afterSelectItem: function () {
                                $("#realData #pro").css("vertical-align", "middle");
                                var gameID = $("#realData #product").val();
                                if (gameID == "") {//没有查询到产品 初始化渠道
                                    var content = "<option value=''>全部</option>";
                                    $("#realData #channel_one").html("").html(content);
                                    $("#realData #channel_one").next("div").remove();
                                    $('#realData #channel_one').searchableSelect();
                                    return false
                                } else {//根据查询到的产品id 初始化渠道和折线图
                                    _self.initChannel();
                                    _self.reloadTable();

                                }
                            }
                        });

                    } else if (response.code == 10004) {
                        alert('登录超时，请重新登录');
                        window.location.href = location.origin + "/login.html";
                    }
                }, error: function (errorMsg) {
                    if (errorMsg.responseJSON.code == 400) {
                        alert('请求错误');
                    } else if (errorMsg.responseJSON.code == 500) {
                        alert('服务器异常');
                    }
                }
            });
        },

        //渠道名称
        initChannel: function (gameId) {
            var _self = this;
            gameId = gameId || $("#realData #product").val();
            $.ajax({
                type: 'GET',
                url: config.path + "/channel/v1/product/" + gameId + "?t=" + Math.random(),
                contentType: 'application/json;charset=utf-8',
                dataType: 'json',
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                success: function (response) {
                    if (response.code == "0") {
                        var html = "<option value=''>全部</option>";
                        response.data.forEach(function (element) {
                            html += "<option value='" + element.channelId + "'>" + element.channelName + "</option>"
                        });
                        $("#realData #channel_one").html("").html(html);
                        $("#realData #channel_one").next("div").remove();
                        $('#realData #channel_one').searchableSelect({
                            afterSelectItem: function () { }
                        });
                        //初始化echarts
                        _self.fetchData([_self.today, _self.yesterday, _self.lastWeek]);
                    } else if (response.code == 10004) {
                        alert('登录超时，请重新登录');
                        window.location.href = location.origin + "/login.html";
                    }
                }, error: function (errorMsg) {
                    if (errorMsg.responseJSON.code == 400) {
                        alert('请求错误');
                    } else if (errorMsg.responseJSON.code == 500) {
                        alert('服务器异常');
                    }
                }
            });
        },

        //选择日期
        chooseDate: function (e) {
            $("#realData .Wdate").val(e);
            this.fetchData([e]);
        },

        fetchData: function (date) {
            for (var key in this.correspond) {
                this.getChartData(date, key);
            }
        },

        getChartData: function (dates, host) {
            var _self = this;
            var gameId = $("#realData #product").val();
            var channel = $("#realData #channel_one").val();
            if (dates instanceof Array === false) {
                throw new Error("first arguments must be array of dates")
            }
            //当前获取过数据的日期
            for (var i = 0; i < dates.length; i++) {
                if (this.chartData.dates.indexOf(dates[i]) === -1) {
                    this.chartData.dates.push(dates[i])
                }
                //保存随机生成的颜色
                if (!this.dateCorrespond[dates[i]]) {
                    this.dateCorrespond[dates[i]] = {};
                    this.dateCorrespond[dates[i]].name = dates[i];
                    this.dateCorrespond[dates[i]].color = '#' + (Math.random() * 0xffffff << 0).toString(16);
                }
                if (!this.chartData[host]) {//如果没有这个对象创建对象存储当前host下的日期
                    this.chartData[host] = []
                }
            }
            //如果数组为空阻止请求
            if (dates.length === 0) {
                return false;
            }
            dates = dates.join(',');

            $.ajax({
                type: 'GET',
                url: config.path + "/channel/v1/realtime?t=" + Math.random() + "&dates=" + dates + "&gameId=" + gameId + "&channel=" + channel,
                contentType: 'application/json;charset=utf-8',
                dataType: 'json',
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                success: function (response) {
                    if (response.code == "0") {
                        var res = response.data;
                        var keys = "";
                        //echarts数据
                        var temp = [];
                        //获取key默认每次请求只返回一个key
                        for (var key in res[0]) {
                            if (key != "date") {
                                keys = key;
                            }
                        }
                        //根据键值创建维度对应对象   
                        if (!_self.chartData[_self.correspond[host][1]]) {
                            _self.chartData[_self.correspond[host][1]] = {}
                        }
                        //添加对应日期数据对象
                        for (var i = 0; i < res.length; i++) {
                            temp = [];
                            //遍历返回数据产生echarts 数据
                            for (var j = 0; j < res[i][keys].length; j++) {
                                temp.push(res[i][keys][j][_self.correspond[host][1]])
                                //temp.push(Math.random()*10000)
                            }
                            _self.chartData[_self.correspond[host][1]][res[i].date] = temp;
                        }
                        //x轴坐标
                        var timeX = [];
                        for (var i = 0; i < res[0][keys].length; i++) {
                            timeX.push(res[0][keys][i].time);
                        }

                        _self.createEchartsOption(_self.correspond[host][1], _self.correspond[host][0], timeX);
                    } else if (response.code == 10004) {
                        alert('登录超时，请重新登录');
                        window.location.href = location.origin + "/login.html";
                    }
                }, error: function (errorMsg) {
                    if (errorMsg.responseJSON.code == 400) {
                        alert('请求错误');
                    } else if (errorMsg.responseJSON.code == 500) {
                        alert('服务器异常');
                    }
                }
            });


        },

        createEchartsOption: function (key, instantiation, x) {
            var options = {};
            var randomColor = "";
            options.xAxis = {
                axisLabel: {
                    //X轴刻度配置
                    interval: 23//'auto' //0：表示全部显示不间隔；auto:表示自动根据刻度个数和宽度自动设置间隔个数
                }
            };
            options.series = [];
            options.legend = { height: "30%", type: 'scroll' };
            options.legend.data = [];
            options.xAxis.data = x;
            //遍历当前已经有日期
            for (var i = 0; i < this.chartData.dates.length; i++) {
                randomColor = '#' + (Math.random() * 0xffffff << 0).toString(16);
                options.series.push({
                    name: this.dateCorrespond[this.chartData.dates[i]] ? this.dateCorrespond[this.chartData.dates[i]].name : this.chartData.dates[i],
                    type: "line",
                    itemStyle: {
                        normal: {
                            color: this.dateCorrespond[this.chartData.dates[i]] ? this.dateCorrespond[this.chartData.dates[i]].color : "",
                            lineStyle: {
                                color: this.dateCorrespond[this.chartData.dates[i]] ? this.dateCorrespond[this.chartData.dates[i]].color : "",
                            }
                        }
                    },
                    data: this.chartData[key][this.chartData.dates[i]]
                })
                options.legend.data.push(this.dateCorrespond[this.chartData.dates[i]] ? this.dateCorrespond[this.chartData.dates[i]].name : this.chartData.dates[i])
            }
            this.myChart.setOption(options);
        },

        //加载列表
        reloadTable: function (gameId, channel) {
            var gameId = $("#realData #product").val() || "";
            var channel = $("#realData #channel_one").val() || "";
            $.ajax({
                type: 'GET',
                url: config.path + "/channel/v1/realtime/new?t=" + Math.random() + "&gameId=" + gameId + "&channel=" + channel,
                contentType: 'application/json;charset=utf-8',
                dataType: 'json',
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                success: function (response) {
                    if (response.code == "0") {
                        $('#realData #tbodyr').empty();
                        if (response.code == 0) {
                            var res = response.data;
                            if (res && res != null) {
                                var html = "";
                                html += '<tr class="gradeX">';
                                html += '<td>' + res.dateTime + '</td>';
                                html += '<td>' + $("#realData #product").text() + '</td>';
                                if ($("#realData #channel_one").val() == '' || $("#realData #channel_one").val() == null) {
                                    html += '<td>全部</td>';
                                } else {
                                    html += '<td>' + $("#realData #channel_one").val() + '</td>';
                                }
                                html += '<td>' + $('.searchable-select-holder').text() + '</td>';
                                html += '<td>' + res.newPlayerCount + '</td>';
                                html += '</tr>';
                                $('#realData #tbodyr').append(html);
                            } else {
                                $('#realData #tbodyr').append('<tr><td colspan="6" class="text-center">没有查询到数据</td></tr>');
                            }
                        } else {
                            $('#realData #tbodyr').append('<tr><td colspan="6" class="text-center">没有查询到数据</td></tr>');
                        }
                    } else if (response.code == 10004) {
                        alert('登录超时，请重新登录');
                        window.location.href = location.origin + "/login.html";
                    }
                }, error: function (errorMsg) {
                    if (errorMsg.responseJSON.code == 400) {
                        alert('请求错误');
                    } else if (errorMsg.responseJSON.code == 500) {
                        alert('服务器异常');
                    }
                }
            });

        },
        ech: function (echartse) {
            echartse.setOption({
                title: {
                    text: ''
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    height: "30%",
                    type: 'scroll',
                    data: ['今日', '昨日', '上周']
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: [],
                    axisLabel: {
                        interval: this.interval[echartse._dom.id],
                        textStyle: {
                            color: "#808080", //刻度颜色
                            fontSize: 12,  //刻度大小
                            width: 20
                        }
                    }
                },
                yAxis: [
                    {
                        type: 'value',
                        axisLabel: {
                            formatter: '{value}'
                        }
                    }],
                series: []
            });

        },

    };

    $(function () {
        realData = realDataInit.initialize();
    });

}).apply(this, [jQuery]);

var realData;