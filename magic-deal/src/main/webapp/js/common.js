var contextPath = "/magic-deal";

// header, nav 이벤트 관련 js 파일입니다.
var nav_flag = false;
var popup_layer;

var u_info = null;

var joinChkObj = {
	id : false,
	password : false,
	nick : false,
	addr : false,
	result : function() {
		return this.id && this.password && this.nick && this.addr;
	}
};

$(function() {
	// 로그인 체크 함수 실행
	loginCheck();
	// nav버튼 처리
	popup_layer = document.getElementById('popupLayer');
	$("#navBtn").on("click", function() {
		if (!nav_flag) {
			// nav_ 안열린 상태
			$("nav").css("left", "0px");
			nav_flag = true;
			if(mainflag) {
				$("section").addClass("sectionOpen");
				$(".disabledWrap").css("display", "block");
			}
		} else {
			// nav_ 열린상태
			$("nav").css("left", "-200px");
			nav_flag = false;
			if(mainflag) {
				$("section").removeClass("sectionOpen");
				$(".disabledWrap").css("display", "none");
			}
		}
	});

	$("#signIdChkBtn").on("click", checkSignUpId);
	$("#signNickNameBtn").on("click", checkSignUpNickName);
});

var alertMsg = function(msg, btn) {
	$("#alertMsg").html(msg);
	$("#alertBtn").html(btn);
	$(".ui.modal.alertModal").modal( {
		allowMultiple : true,
		closable : false,
		onApprove : function() {
			return true;
		}
	}).modal('show');
};
// 회원가입 관련 함수
var foldDaumPostcode = function() {
	var topPos = parseInt($(".ui.modal.signUpModal").css("top"));
	$(".ui.modal.signUpModal").css("top", topPos+150+"px");
	popup_layer.style.display = 'none';
	$("#signUpCloseBtn").prop("disabled", false);
};

var execDaumPostcode = function() {
	$("#signUpCloseBtn").prop("disabled", true);
	new daum.Postcode({
		width : "100%",
		height : "100%",
		onclose : function(state) {
			$("#signUpCloseBtn").prop("disabled", false);
			if(state === 'COMPLETE_CLOSE'){
	            //사용자가 검색결과를 선택하여 팝업창이 닫혔을 경우, 실행될 코드를 작성하는 부분입니다.
	            //oncomplete 콜백 함수가 실행 완료된 후에 실행됩니다.
				joinChkObj.addr = true;
	        }
		},
		oncomplete : function(data) {
			var fullAddr = data.address;
			var extraAddr = "";
			
			 // 기본 주소가 도로명 타입일때 조합한다.
            if(data.addressType === 'R'){
                //법정동명이 있을 경우 추가한다.
                if(data.bname !== ''){
                    extraAddr += data.bname;
                }
                // 건물명이 있을 경우 추가한다.
                if(data.buildingName !== ''){
                    extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                }
                // 조합형주소의 유무에 따라 양쪽에 괄호를 추가하여 최종 주소를 만든다.
                fullAddr += (extraAddr !== '' ? ' ('+ extraAddr +')' : '');
            }
            
            $("#signAddr").val(fullAddr);
            var geocoder = new daum.maps.services.Geocoder();
            geocoder.addr2coord(data.address, function(status, result) {
                // 정상적으로 검색이 완료됐으면
                if (status === daum.maps.services.Status.OK) {
                    // 해당 주소에 대한 좌표를 받아서
                    var lat = result.addr[0].lat;
                    var lng = result.addr[0].lng;
                    
                    $("#signLat").val(lat);
                    $("#signLng").val(lng);
                }
            });
            
            popup_layer.style.display = 'none';
            var topPos = parseInt($(".ui.modal.signUpModal").css("top"));
            $(".ui.modal.signUpModal").css("top", topPos+150+"px");
		}
	}).embed(popup_layer);
	
	popup_layer.style.display = 'block';
	var topPos = parseInt($(".ui.modal.signUpModal").css("top"));
	$(".ui.modal.signUpModal").css("top", topPos-150+"px");
};

// 상태검사 함수
var chkFormStatus = function(val) {
	// 상태 검사
	var status = {};
	status.flag = true;
	status.msg = "";
	return status;
};

var checkSignUpId = function() {
	var chk_id = $("#signId").val();
	var chk = chkFormStatus(chk_id);
	if(chk.flag) {
		$.getJSON(contextPath+"/member/checkId.do?id="+chk_id, function(resultObj) {
			var result = resultObj.ajaxResult;
			if(result.msg == '0') {
				// 중복검사 성공
				$("#signId").prop("readonly", true);
				$("#signId").css({
					"font-weight" : "bold",
					"color" : "#00b5ad"
				});
				$("#signIdChkBtn").text("사용가능한 아이디");
				$("#signIdChkBtn").addClass("olive");
				$("#signIdChkBtn").prop("disabled", true);

				joinChkObj.id = true;
				$("#signPass").focus();
			}else {
				// 중복검사 실패
				alertMsg("이미 사용중인 아이디 입니다!", "확인");
				$("#signId").attr("placeholder", "이미 사용중인 아이디");
				$("#signId").focus();
			}
		});
	}else {
		alertMsg(chk.msg, "확인");
	}
};

var checkSignUpNickName = function() {
	var chk_nick = $("#signNickName").val();
	var chk = chkFormStatus(chk_nick);
	if(chk.flag) {
		$.getJSON(contextPath+"/member/checkNick.do?nick="+chk_nick, function(resultObj) {
			var result = resultObj.ajaxResult;
			if(result.msg == '0') {
				// 중복검사 성공
				$("#signNickName").prop("readonly", true);
				$("#signNickName").css({
					"font-weight" : "bold",
					"color" : "#00b5ad"
				});
				
				$("#signNickNameBtn").text("사용가능한 닉네임");
				$("#signNickNameBtn").addClass("olive");
				$("#signNickNameBtn").prop("disabled", true);
				
				joinChkObj.nick = true;
			}else {
				// 중복검사 실패
				alertMsg("이미 사용중인 닉네임입니다!", "확인");
				$("#signNickName").attr("placeholder", "이미 사용중인 닉네임");
				$("#signNickName").focus();
			}
		});
	}else {
		alertMsg(chk.msg, "확인");
	}
};

var passwordChk = function() {
	var pass1 = $("#signPass").val();
	var pass2 = $("#signPassChk").val();
	
	return pass1 == pass2;
};

var signUpSubmitChk = function() {
	joinChkObj.password = passwordChk();
	if(joinChkObj.result()) {
		// 폼 검사 적격 회원가입 진행
		return true;
	}else {
		// 폼 검사 부적격
		alertMsg("입력이 누락되거나 잘못되었습니다!!", "확인");
		return false;
	}
};

var signUpCommit = function(flag) {
	if(flag) {
		var id = $("#signId").val();
		var pass = $("#signPass").val();
		var nick = $("#signNickName").val();
		var addr = $("#signAddr").val();
		var lat = $("#signLat").val();
		var lng = $("#signLng").val();
		
		console.log(id, pass, nick, addr, lat, lng);
		
		$.post(contextPath+"/member/signUp.do", {
			id : id,
			password : pass,
			nickName : nick,
			mAddr : addr,
			mLat : lat,
			mLon : lon
		}, function(resultObj) {
			var result = resultObj.ajaxResult;
			if(result.msg == 'success') {
				joinSuccessMsg("환영합니다!!<br/> 사용을 위해 로그인해주세요!", "확인");
			}
		}, "json");
	}
};

var joinSuccessMsg = function(msg, btn) {
	$("#alertMsg").html(msg);
	$("#alertBtn").html(btn);
	$(".ui.modal.alertModal").modal( {
		allowMultiple : true,
		closable : false,
		onApprove : function() {
			signUpClose();
		}
	}).modal('show');
};

var signUpClose = function() {
	$("#signUpCloseBtn").trigger("click");
	clearSignUpForm();
};

var clearSignUpForm = function() {
	joinChkObj.id = false;
	joinChkObj.password = false;
	joinChkObj.nick = false;
	joinChkObj.addr = false;
	
	var id = $("#signId").val("");
	var pass = $("#signPass").val("");
	var pass = $("#signPassChk").val("");
	var nick = $("#signNickName").val("");
	var addr = $("#signAddr").val("");
	var lat = $("#signLat").val("");
	var lng = $("#signLng").val("");
	
	$("#signNickName").prop("readonly", false);
	$("#signNickName").css({
		"font-weight" : "normal",
		"color" : "black"
	});
	
	$("#signNickNameBtn").text("중복검사");
	$("#signNickNameBtn").removeClass("olive");
	$("#signNickNameBtn").prop("disabled", false);

	$("#signId").prop("readonly", false);
	$("#signId").css({
		"font-weight" : "normal",
		"color" : "black"
	});
	
	$("#signIdChkBtn").text("중복검사");
	$("#signIdChkBtn").removeClass("olive");
	$("#signIdChkBtn").prop("disabled", false);
};

var loginSubmit = function() {
	var id = $("#loginId").val();
	var pass = $("#loginPass").val();
	
	$.post(contextPath + "/member/login.do", {
		id : id,
		password : pass
	}, function(resultObj) {
		var result = resultObj.ajaxResult;
		if(result.msg == 'success') {
			loginSuccess(result.data);
			$("#loginCloseBtn").trigger("click");
		}else {
			alertMsg('로그인 정보가 틀렸습니다.<br/>다시 확인해주세요!', "확인");
			$("#loginId").focus();
		}
	}, "json");
};

var loginSuccess = function(data) {
	u_info = data;
	loginBoxDraw();
};

var loginClose = function() {
	$("#loginId").val("");
	$("#loginPass").val("");
};

var loginCheck = function() {
	$.get(contextPath + "/member/loginCheck.do", function(resultObj) {
		var result = resultObj.ajaxResult;
		u_info = result.data;
		loginBoxDraw();
	}, "json");
};

var logout = function() {
	$.get(contextPath + "/member/logout.do", function() {
		u_info = null;
		loginBoxDraw();
	},"json");
};

var loginBoxDraw = function() {
	var logBoxWrap = $("#loginStatusWrap");
	var loginBox;
	if(u_info) {
		// 로그인 상태
		loginBox = '<div id="chatBtn" class="ui icon label">';
		loginBox += '<i class="comment icon"></i> 3';
		loginBox += '</div>';
		loginBox += '<div id="alarmBtn" class="ui icon label">';
		loginBox += '<i class="alarm icon"></i> 3';
		loginBox += '</div>';
		loginBox += '<img class="ui avatar image" src="../img/sample-test/profile-exam.JPG">';
		loginBox += '<span>'+u_info.nickName+'</span>';
		loginBox +=  '<div id="logoutBtn" class="ui icon label">';
		loginBox += '<i class="sign out violet icon"></i>';
		loginBox += '<a class="detail">로그아웃</a></div>';
	}else {
		// 로그아웃 상태
		loginBox =  '<div id="loginNsignupBtn" class="ui icon label">';
		loginBox += '<i class="user violet icon"></i>';
		loginBox += '<a class="detail">로그인 및 회원가입</a></div>';
	}
	logBoxWrap.html(loginBox);
	
	if(u_info) {
		logBoxWrap.find("#logoutBtn").on("click", function() {
			logout();
		});
	}else {
		logBoxWrap.find("#loginNsignupBtn").on("click", function() {
			$('.loginModal').modal({
				closable : false,
				onDeny : function() {
					loginSubmit();
					// false 리턴하면 모달창 안닫힘
					// true 리턴 or 아무것도 리턴 안하면 모달창 닫힘
					return false;
				},
				onApprove : function() {
					$(".signUpModal").modal({
						closable : false,
						onDeny : function() {
							return true;
						},
						onApprove : function() {
							var signFlag = signUpSubmitChk();
							signUpCommit(signFlag);
							return false;
						}
					}).modal('show');
				}
			}).modal('setting', 'transition', 'scale').modal('show');
		});
	}
};