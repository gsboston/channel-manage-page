(function ($) {

    'use strict';

    var overViewInit = {

        initialize: function () {
            this
                .setVars()
                .build()
                .events();

            console.log('overview');
            showNav();
            return this;
        },

        setVars: function () {
            this.yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000).format('yyyy-MM-dd');
            return this;
        },

        build: function () {
            $("#startDate").val(this.yesterday);
            $("#endDate").val(this.yesterday);

            this.initProductSelect();

            this.reloadTable({
                startDate: $("#startDate").val(),
                endDate: $("#endDate").val(),
                gameId: $("#product").val(),
                channel: $("#channel_one").val()
            });

            return this;
        },

        events: function () {
            var _self = this;

            // $("#overView #gameId").change(function () {
            //     var gameID = $("#overView #gameId").val();
            //     if (gameID == "") {
            //         var content = "<option value=''>全部</option>";
            //         $("#overView #channel_one").html("").html(content);
            //         $("#overView #channel_one").next("div").remove();
            //         $('#overView #channel_one').searchableSelect();
            //         return false
            //     } else {
            //         _self.initChannel(gameID);
            //     }
            // });

            //查询
            $("#overView #search").on("click", function () {
                var start = $("#startDate").val();
                var end = $("#endDate").val();
                if (Number(end.slice(5, 7)) - Number(start.slice(5, 7)) > 0) {
                    alert("查询时间不支持跨月");
                    return false;
                }
                
                _self.reloadTable({
                    startDate: $("#startDate").val(),
                    endDate: $("#endDate").val(),
                    gameId: $("#product").val(),
                    channel:$("#channel_one").val()
                });
            });

            return this;
        },

        //初始化产品名称下拉
        initProductSelect: function () {
            var _self=this;
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
                        var html = "<option value=''>全部</option>";
                        response.data.forEach(function (element) {
                            html += "<option value='" + element.gameId + "'>" + element.gameName + "</option>"
                        });
                        $("#overView #product").html("").html(html);
                        $("#overView #product").next("div").remove();
                        $('#overView #product').searchableSelect({
                            afterSelectItem: function () {
                                $("#overView #pro").css("vertical-align", "middle");
                                var gameID = $("#overView #product").val();
                                if (gameID == "") {
                                    var content = "<option value=''>全部</option>";
                                    $("#overView #channel_one").html("").html(content);
                                    $("#overView #channel_one").next("div").remove();
                                    $('#overView #channel_one').searchableSelect();
                                    return false
                                } else {
                                    _self.initChannel(gameID);
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

        initChannel: function (gameId) {
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
                        $("#overView #channel_one").html("").html(html);
                        $("#overView #channel_one").next("div").remove();
                        $('#overView #channel_one').searchableSelect({
                            afterSelectItem: function () {
                                $("#one,#two").css("vertical-align", "middle");
                                var gameID = $("#overView #product").val();
                                var channel_one = this.holder.data("value");
                                if (gameID == "" || channel_one == "") {
                                    $("#overView #channel_two").next("div").remove();
                                    $("#overView #channel_two").empty().show();
                                    return false
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

        //加载表格数据
        reloadTable: function (option) {
            $.ajax({
                type: 'GET',
                url: config.path + "/channel/v1/overview?t=" + Math.random(),
                data: option,
                dataType: 'json',
                contentType: 'application/json;charset=utf-8',
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                success: function (response) {
                    $('#overView #overView_tbody').html('');
                    if (response.code == 0) {
                        var res = response.data;
                        if (res != '') {
                            var html = "";
                            for (var i = 0; i < res.length; i++) {
                                html += '<tr  class="gradeX">' +
                                    '<td>' + res[i].date + '</td>' +
                                    '<td>' + res[i].gameName + '</td>' +
                                    '<td><span class="left_span">' + res[i].clientType + '</span></td>' +
                                    '<td><span class="left_span">' + res[i].channelName + '</span></td>' +
                                    '<td><span class="left_span">' + res[i].channelId + '</span></td>' +
                                    '<td><span class="left_span">' + res[i].cooperationMode + '</span></td>' +
                                    '<td><span class="left_span">' + res[i].newPlayerCount + '</span></td>' +
                                    '</tr>';
                            }
                            $('#overView #overView_tbody').append(html);
                        } else {
                            $('#overView #overView_tbody').append('<tr><td colspan="14" class="text-center">没有查询到数据</td></tr>');
                        }
                    } else {
                        $('#overView #overView_tbody').append('<tr><td colspan="14" class="text-center">没有查询到数据</td></tr>');
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

    };

    $(function () {
        overView = overViewInit.initialize();
    });

}).apply(this, [jQuery]);

var overView;