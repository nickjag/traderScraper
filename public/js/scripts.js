

$('#update-url').on('click', function() {
	
	$('#activity-overlay').show();
	
	if (confirm("Warning: Changing the vehicle search will delete the current vehicle history!")) {
		$.ajax({
			type: "POST",
			url: "./update",
			data: 'url=' + encodeURIComponent($('#url').val()),
			cache: false,
			success: function(data,textStatus) {
				$('#activity-overlay').fadeOut(300);
				var output = $.parseJSON(data);
				alert(output.message);
				window.location = window.location;
			}
		});
	}
	else {
		
		$('#activity-overlay').fadeOut(300);
	}
});

function formatMoney(amt) {
	
	amt = parseFloat(amt);
	formattedAmt = '$' + amt.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	return formattedAmt;
}