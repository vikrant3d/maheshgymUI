var code = "MG/";
var contextPath = "https://wjyr4uj3w2.execute-api.ap-south-1.amazonaws.com/dev/"+code;

var NumberRegex = /^[0-9]*$/;
function getFormData(form){
    var unindexed_array = $(form).serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function(n, i){
		var name = n['name'];
		var value = n['value'];
		if(name == 'custDOJ'){
			var value1 = value.split("/");			
			value = value1[2]+"-"+value1[1]+"-"+value1[0];
		}
        indexed_array[name] = value;
    });

    return indexed_array;
}

function submitCustDetails(obj){
	if(! checkValidation()){		
		return false;
	}
	if($("#custAmountPayDOJ").val() == ""){
		$("#custAmountPayDOJ").val('0');
	}
	$("#footerSection").hide();
	$("#confirmBody").html("Please wait you data is been progress");
	$('#confirmModal').modal('show');
	var custPic="";
	var custDoc="";
	
	if($("#custPic-image").attr('src') != undefined && $("#custPic-image").attr('src') != ""){
		custPic = $("#custPic-image").attr('src').split(',')[1];
	}
	if($("#custDoc-image").attr('src') != undefined && $("#custDoc-image").attr('src') != ""){
		custDoc = $("#custDoc-image").attr('src').split(',')[1];
	}
	var map = getFormData("#customerDetails");
	map["custPic"]=custPic;
	map["custDoc"]=custDoc;
	map["token"]=sessionStorage.getItem(code + "_token");
	 $.ajax({
	  type: 'POST',
	  url: contextPath +"updateCustData",
	 data: JSON.stringify(map),	 
	  success: function (response) { 
			$("#footerSection").show();
			$("#confirmBody").html(response);
			},
	  error : function (response) { 		
			
			alert(response);
			location.href="login.html"	
			}
	});
	return false;
}

function closePopUp(){
	$('#confirmModal').modal('hide');
	location.reload();
	return false;
}

function checkValidation(){
	if($("#custFullName").val() == "" ){
		$("#footerSection").show();
		$("#confirmBody").html("Please Enter Customer Name");
		$('#confirmModal').modal('show');
		return false;
	}else if($("#custMobileNo").val() == "" || $("#custMobileNo").val().length != 10 || ! NumberRegex.test($("#custMobileNo").val())){
		$("#footerSection").show();
		$("#confirmBody").html("Please Enter valid Customer mobile number");
		$('#confirmModal').modal('show');
		return false;
	}else if($("#custAmountToPay").val() == "" || isNaN($("#custAmountToPay").val())){
		$("#footerSection").show();
		$("#confirmBody").html("Please Enter valid Monthly Amount to Pay");
		$('#confirmModal').modal('show');
		return false;
	}
	return true;
	
}
var todate;
function submitCustAmount(obj){
	
	if($("#dateOfPayment").val() =="" || $("#myInput").val() == ""){
			$("#confirmBody").html("Please enter required details");
			$("#confirmbtn").hide();
			$("#confirmModal").modal('show');
			return false;
	}else{
		var msg = "Are you sure you want to make payment ";
		todate = $("#dateOfPaymentToMonth").val();
		if(todate == ""){
			todate = $("#dateOfPayment").val();
			msg = msg + "for "+$("#dateOfPayment").val().substr(3)+" month?"
		}else{
			msg = msg + "from "+$("#dateOfPayment").val().substr(3)+" month to "+$("#dateOfPaymentToMonth").val().substr(3)+" month?"
		}
		$("#footerSection").show();
		$("#confirmbtn").show();
		$("#confirmBody").html(msg);
		$("#confirmModal").modal('show');
	}
}

function confirmPayment(){
	$("#confirmModal").modal('show');
	$("#confirmBody").html("Please wait...");
	var index = $("#myInput").val().lastIndexOf("#")+1;
	var myid = $("#myInput").val().substring(index+1);
	var map = getFormData("#customerDetails");
	map["id"]=myid;
	map["amountPaidDate"]=$("#dateOfPayment").val();
	map["dateOfPaymentToMonth"]=todate;
	map["token"]=sessionStorage.getItem(code + "_token");
	  $.ajax({
	  type: 'POST',
	  url: contextPath +"submitCustAmount",
	  data: JSON.stringify(map),		 
	  success: function (response) { 
			$("#confirmBody").html(response);
			$("#confirmbtn").hide();
			},
	  error : function (response) { 						
			$("#confirmBody").html(response);
			$("#confirmbtn").hide();
			$("#confirmModal").modal('show');
			location.href="login.html"	
			}

	});
	return false;
}

function generateCustRow(response1){
	var count = 1;
	var jsonData = {};
	$.each(response1, function(key,response) {	
			var active ="In-Active";
			if($(response).attr("smsEmailStatus") == 'A'){
				active = "Active";
			}
			var newRow = "<tr><td>"+count+"</td><td>"+$(response).attr("custFullName")+"</td><td>"+$(response).attr("custMobileNo")+"</td>"+
				"<td>"+$(response).attr("custEmailId")+"</td><td>"+$(response).attr("custBillingDay")+"</td><td>"+$(response).attr("custAmountToPay")+"</td><td>"+active+"</td>"+
				'<td class="center"><input type="button" class="btn btn-primary btn-xs" value="Edit" data-id="'+$(response).attr("id")+'" onclick="return fetchCustomerDetails(this)">&nbsp;<input type="button" value="Delete" data-id="'+$(response).attr("id")+'" class="btn btn-primary btn-xs" onclick="return deleteCustomerDetails(this)"></td>'+
				'</tr>';
			$("#custDetailsTable tbody").append(newRow);
			count++;		
			jsonData["91"+$(response).attr("custMobileNo")] = $(response).attr("custFullName");			
		 });
		 localStorage.setItem("custDetails",JSON.stringify(jsonData));
		 $('#custDetailsTable').DataTable().destroy();
		$('#custDetailsTable').DataTable({
	        responsive: true,
			"order": [],			
			iDisplayLength:50,
			lengthMenu:[[10,50,100,200,-1],[10,50,100,200,"ALL"]]			
        	});
 		$("#custDetailsTable").parent().addClass('table-responsive');
		
}

function fetchCustomerDetails(obj){
	$('#lodaingModal').modal('show');
	var map= {};
	map["id"]=$(obj).attr('data-id');
	$.ajax({
  type: 'POST',
   data: JSON.stringify(map),
  url: contextPath +"getCustomerDetailsByCustId",
  success: function (response1) { 
		$("input[name='custFullName']").val($(response1).attr('custFullName'));
		$("input[name='id']").val($(response1).attr('id'));
		$("input[name='custAddress']").val($(response1).attr('custAddress'));
		$("input[name='additionalNote']").val($(response1).attr('additionalNote'));
		$("input[name='custMobileNo']").val($(response1).attr('custMobileNo'));
		$("input[name='custEmailId']").val($(response1).attr('custEmailId'));
		var dateOfJoin = $(response1).attr('custDOJ').substr(0,10);
		dateOfJoin = dateOfJoin.split("-");
		$("input[name='custDOJ']").val(dateOfJoin[2]+"/"+dateOfJoin[1]+"/"+dateOfJoin[0]);
		$("#custBillingDay").val($(response1).attr('custBillingDay'));
		$("input[name='custAmountPayDOJ']").val($(response1).attr('custAmountPayDOJ'));
		$("input[name='custAmountToPay']").val($(response1).attr('custAmountToPay'));
		$("#smsEmailStatus").val($(response1).attr('smsEmailStatus'));
		$("html, body").animate({ scrollTop: 0 }, "slow");
		$("input[name='custMobileNo']").prop('readonly',true);
		$("#currentMonthFee").val($(response1).attr('currentMonthFee'));
		fetchImageDetails($(response1).attr('id'),'image-sec');
		$('#lodaingModal').modal('hide');
	}
});	
	return false;
}
/*checkSessionDetails();
function checkSessionDetails(){
	   var a = window.location.href;
	   var b= a.substring(a.lastIndexOf("/")+1)
		if(sessionStorage.getItem("gymdetails") != "Y" && b!="login.html"){
			
			location.href="login.html";
		}
}*/
function deleteCustomerDetails(obj){
	
	var r = confirm("Are you sure you want to delete this customer?");
	if (r == true) {
		var map= {};
	map["id"]=$(obj).attr('data-id');
	map["token"]=sessionStorage.getItem(code + "_token");
		 $.ajax({
		 type: 'POST',
		 data: JSON.stringify(map),
		 url: contextPath +"deleteCustomerDetails",
		 success: function (response1) { 
				alert(response1);
				location.reload();
			},
		error : function (response) { 
			alert(response);
			location.href="login.html"				
        }
		});
	}
	
	return false;
}

function newCustDetails(){
	location.reload();
}

function getAllCustDetails(){
	$('#lodaingModal').modal('show');
	var map={};
	map["token"]=sessionStorage.getItem(code + "_token");
	
  $.ajax({
  type: 'POST',
  data: JSON.stringify(map),
  url: contextPath +"getAllCustomerDetails",
  success: function (response) { 
		generateCustRow(response);
		$('#lodaingModal').modal('hide');
       },
  error : function (response) { 
		alert("Error "+response);
		$('#lodaingModal').modal('hide');
		location.href="login.html"	
        }

});
}

function fetchCustPayImageDetails(obj){
	return fetchImageDetails2($(obj).attr('data-id'),obj);
}
function getAllCustPaymentInfo(){		
		$.ajax({
		  type: 'POST',
		  url: contextPath +"getAllCustPaymentInfo",
		  success: function (response1) { 	
					var count = 0;
					var amount = 0;
					$.each(response1, function(key,response) {	
						var imgkey = "image-sec-"+$(response).attr("custId");
						var imgDiv = '<div class="'+imgkey+'"><img id="great-image" style=""></div>';
						var newRow = "<tr><td>"+ ++key +"&nbsp;&nbsp;<input type='button' value='Photo' data-id="+$(response).attr("custId")+" onClick='return fetchCustPayImageDetails(this)' class='btn btn-primary btn-xs' ></td><td>"+$(response).attr("custFullName")+"&nbsp;"+imgDiv+"</td><td>"+$(response).attr("amount")+"</td></tr>";
						$("#custDetailsTable tbody").append(newRow);
						amount = amount + parseInt($(response).attr("amount"));
						count++;			
					 });
					 $("#custCount").html(count);
					 $("#custCountAmt").html(amount);
					 $('#custDetailsTable').DataTable().destroy();
					$('#custDetailsTable').DataTable({
						responsive: true,
						"order": [],
						iDisplayLength:100,
						lengthMenu:[[10,50,100,200,-1],[10,50,100,200,"ALL"]]
						});
						$("#custDetailsTable").parent().addClass('table-responsive');
				}
			});
}


function getNotificationDetails(){		
		$.ajax({
		  type: 'POST',
		  url: contextPath +"getPreNotificationCust",
		  success: function (response1) { 	
					
					$.each(response1, function(key,response) {
						var imgkey = "image-sec-"+$(response).attr("custId");
						var imgDiv = '<div class="'+imgkey+'"><img id="great-image" style=""></div>';						
						var newRow = "<tr><td>"+ ++key +"&nbsp;&nbsp;<input type='button' value='Photo' data-id="+$(response).attr("id")+" onClick='return fetchCustPayImageDetails(this)' class='btn btn-primary btn-xs' ></td><td>"+$(response).attr("custFullName")+"&nbsp;"+imgDiv+"</td><td>"+$(response).attr("custAmountToPay")+"</td><td>"+$(response).attr("custBillingDay")+"</td></tr>";
						$("#custDetailsPreTable tbody").append(newRow);
								
					 });					
				}
			});
			
			
		 $.ajax({
		  type: 'POST',
		  url: contextPath +"getPostNotificationCust",
		  success: function (response1) {
					$.each(response1, function(key,response) {	
						var imgkey = "image-sec-"+$(response).attr("custId");
						var imgDiv = '<div class="'+imgkey+'"><img id="great-image" style=""></div>';
						var newRow = "<tr><td>"+ ++key +"&nbsp;&nbsp;<input type='button' value='Photo' data-id="+$(response).attr("id")+"  onClick='return fetchCustPayImageDetails(this)' class='btn btn-primary btn-xs' ></td><td>"+$(response).attr("custFullName")+"&nbsp;"+imgDiv+"</td><td>"+$(response).attr("custAmountToPay")+"</td><td>"+$(response).attr("custBillingDay")+"</td></tr>";
						$("#custDetailsPostTable tbody").append(newRow);
								
					 });					
				}
			});
}

function doLogin(obj){
	$(obj).attr('value','Please wait...').prop('disabled',true);
	var map={};
	map["venderPass"]=$("#password").val();	
	$.ajax({
		  type: 'POST',
		  data:JSON.stringify(map),	
		  url: contextPath +"checkLogin",
		  success: function (response1) { 	
					if(response1.length == 8){
						sessionStorage.setItem(code + "_token", response1);
						location.href="CustRegistration.html"	
					}else{
						$(obj).attr('value','Login').prop('disabled',false);
						alert(response1);
					}					
				}
			});
			
}


    function uploadFileToServer(){
        var formData = new FormData();
        formData.append("empid","2");
        formData.append("file64",$("#great-image").attr('src').split(',')[1]);
        $.ajax({
            type: "POST",
            url: contextPath +"upload",
            data: formData,
            contentType: false,
            processData: false,
            success: function (data) {
                alert(data)
            },
            error: function (e) {
                alert(e);
            }
        });
    }

	function resizeCustPic(){
		resizeImageToSpecificWidth("custPic",input2);
		
	}
	
	function resizeDocPic(){
		resizeImageToSpecificWidth("custDoc",input3);
		
	}

    function resizeImageToSpecificWidth(imgPath,myInput) {
		var width = 200;
        if (myInput.files && myInput.files[0]) {
            var reader = new FileReader();
            reader.onload = function(event) {
                var img = new Image();
                img.onload = function() {
                    if (img.width > width) {
                        var oc = document.createElement('canvas'), octx = oc.getContext('2d');
                        oc.width = img.width;
                        oc.height = img.height;
                        octx.drawImage(img, 0, 0);
                        while (oc.width * 0.5 > width) {
                            oc.width *= 0.5;
                            oc.height *= 0.5;
                            octx.drawImage(oc, 0, 0, oc.width, oc.height);
                        }
                        oc.width = width;
                        oc.height = oc.width * img.height / img.width;
                        octx.drawImage(img, 0, 0, oc.width, oc.height);
						$(".fa-refresh").remove();
                        document.getElementById(imgPath+"-image").src = oc.toDataURL();
                    }
                };
                document.getElementById(imgPath+"-orignal").src = event.target.result;
                img.src = event.target.result;
            };
            reader.readAsDataURL(myInput.files[0]);
        }
    }

    function fetchImageDetails(custid,divClass){
		$("."+divClass+"-cust").append('<i class="fa fa-refresh fa-spin " style="font-size: 81px;color: #2e6da4;"></i>');
		$("."+divClass+"-cust").find('img').attr('src','data:image/png;base64,');
		
		$("."+divClass+"-doc").append('<i class="fa fa-refresh fa-spin " style="font-size: 81px;color: #2e6da4;"></i>');
		$("."+divClass+"-doc").find('img').attr('src','data:image/png;base64,');
		var map= {};
		map["id"]=custid;
        $.ajax({
            type: "POST",
            url: contextPath +"downloadPic",
            data: JSON.stringify(map),
            success: function (response) {
				$("."+divClass+"-cust").find('.fa-refresh').remove();
				$("."+divClass+"-doc").find('.fa-refresh').remove();
                $("."+divClass+"-cust").find('img').attr('src','data:image/png;base64,'+$(response).attr('custPic'));  
				$("."+divClass+"-doc").find('img').attr('src','data:image/png;base64,'+$(response).attr('custDoc'));  				
            },
            error: function (e) {
                alert(e);
            }
        });
    }
	
	function fetchImageDetails2(custid,obj){
		var div = $(obj).parent().next().find('div');
		$(div).append('<i class="fa fa-refresh fa-spin " style="font-size: 81px;color: #2e6da4;"></i>');
		$(div).find('img').attr('src','data:image/png;base64,');
		var map= {};
		map["id"]=custid;
        $.ajax({
            type: "POST",
            url: contextPath +"downloadPic",
            data: JSON.stringify(map),
            success: function (response) {
				$(div).find('.fa-refresh').remove();
				$(div).find('img').attr('src','data:image/png;base64,'+$(response).attr('custPic'));  				
            },
            error: function (e) {
                alert(e);
            }
        });
    }
	
	function moreThanOneMonthDetails(){
		$(".moreThanOneMonth").show();
		$("#labelmoreThanOneMonth").hide();
		
	}
	
	function getMonthWiseData(){
			$('#lodaingModal').modal('show');
			var map= {};
		map["date"]=$("#dateOfPayment").val();
		  $.ajax({
		  type: 'POST',
		  url: contextPath +"getAllCustomerPaymentStatus",
		  data: JSON.stringify(map),	
		  success: function (response1) { 	
				$("#paymentStatus tbody").empty();			  
				$.each(response1, function(key,response) {	
						var imgkey = "image-sec-"+$(response).attr("custId");
						var imgDiv = '<div class="'+imgkey+'"><img id="great-image" style=""></div>';				
						var newRow = "<tr><td>"+ ++key +"&nbsp;&nbsp;<input type='button' value='Photo' data-id="+$(response).attr("id")+" class='btn btn-primary btn-xs' onClick='return fetchCustPayImageDetails(this)' ></td><td>"+$(response).attr("custFullName")+" &nbsp; "+imgDiv+"</td><td>"+$(response).attr("custMobileNo")+"</td><td>"+$(response).attr("currentMonthFee")+"</td></tr>";
						$("#paymentStatus tbody").append(newRow);
				});
					$('#lodaingModal').modal('hide');
			   },
		  error : function (response) { 
				$('#lodaingModal').modal('hide');
				alert("Error "+response);
        }

		});
		return false;
	}

		function updateDetailsNotification(obj,mycode){
			var map= {};
			map["id"]=mycode;
			map["details"]=$(obj).parent().parent().find("#details").find("#details").val();
			map["token"]=sessionStorage.getItem(code + "_token");
			 $.ajax({
			  type: 'POST',
			  url: contextPath +"updateNotificationDetails",
			 data: JSON.stringify(map),
			 success: function (response) { 					
						alert(response);
					},
			  error : function (response) {
						alert(response);
						location.href="login.html"						
					}
			});
	}	
	 
	function getDetailsNotification(){
		var map= {};
			map["token"]=sessionStorage.getItem(code + "_token");
			 $.ajax({
			  type: 'POST',
			   data: JSON.stringify(map),
			  url: contextPath +"getAllNotificationDetails",
			  success: function (response1) { 					
						$.each(response1, function(key,response) {
							$("."+$(response).attr("id")).val($(response).attr("details"));
						});
					},
			  error : function (response) {
						alert(response);
						location.href="login.html"							
					}
			});
	}	
	
	function sendNotificationToAllCust(){
		
		$("#confirmModal").modal('show');
		
	}	
	
	function yesSendNotificationtoAll(){
		$("#footerSection").hide();
		$("#confirmBody").html('Please wait...');
		var map= {};
			map["token"]=sessionStorage.getItem(code + "_token");
			map["message"]=$("#message").val();
			 $.ajax({
			  type: 'POST',
			   data: JSON.stringify(map),
			  url: contextPath +"sendNotificationToAllCust",
			  success: function (response1) { 					
						$("#footerSection2").show();
						$("#confirmBody").html(response1);
						
					},
			  error : function (response1) {
						$("#footerSection2").show();
						$("#confirmBody").html(response1);
					}
			});
			return false;
	}
	
	function changePassword(){
	if($("#newpassword").val() == ""){
		alert('Password should not be blank');
		return false;
	}
	
	if($("#newpassword").val() == $("#confirmpassword").val()){
		
			var map={};
			map["token"]=sessionStorage.getItem(code + "_token");
			map["venderPass"]=$("#newpassword").val();
					
		  $.ajax({
		  type: 'POST',
		  data: JSON.stringify(map),
		  url: contextPath +"updatePassword",
		  success: function (response) { 
				alert("Password updated successfully.")
				
				location.href="login.html"
			   },
		  error : function (response) { 
				alert("Error : "+response.responseText);
				
				location.href="login.html"
				}

		});
		
		
	}else{
		alert("Your New Password and Confirm Password does not match")
	}
	
	
}