function searchToObject() {
  var pairs = window.location.search.substring(1).split("&"),
    obj = {},
    pair,
    i;

  for ( i in pairs ) {
    if ( pairs[i] === "" ) continue;

    pair = pairs[i].split("=");
    obj[ decodeURIComponent( pair[0] ) ] = decodeURIComponent( pair[1] );
  }

  return obj;
}

$(document).ready(function () {
  
  var params = searchToObject();
  
  if (params && params['ideaId']) {
  
    $('a[href*=":ideaId"]').each(function () {
      $(this).attr('href', $(this).attr('href').replace(':ideaId', params['ideaId']));
    })
  
  }
})
