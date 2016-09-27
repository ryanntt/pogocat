$(document).ready(function() {
  //Create a list of pokemon
  var pokemons =[];
  var dustLevels = [];
  var list = godex.pokemon;
  var dustList = dex.dustLevels;

  for (p in list) {
    var pokemon = list[p];
    pokemons.push({id: pokemon['id'], name: pokemon['name']});
  }

  for (d in dustList) {
    dustLevels.push({stardust: dustList[d]});
    // console.log(dust);
  }

  //Populate the select field with Pokemon List
  $('#pokemonName').selectize({
    maxItems: 1,
    valueField: 'name',
    labelField: 'name',
    searchField: 'name',
    options: pokemons,
    create: false
  });

  $('#stardust').selectize({
    maxItems: 1,
    valueField: 'stardust',
    labelField: 'stardust',
    searchField: 'stardust',
    options: dustLevels,
    create: false
  });
});

function checkIV() {
  if ( isFormFilled() ) {
    var result = dex.appraise({
      pokemon: $('#pokemonName').val().toString(),
      cp: $('#cp').val(),
      hp: $('#hp').val(),
      dust: $('#stardust').val(),
      powered: $('#powered-up').prop('checked'),    // powered up?
      strongAtk: $('#attack').prop('checked'), // Gym Leader says "x" is
      strongDef: $('#defense').prop('checked'),  // your poke's best stat,
      strongHP: $('#stamina').prop('checked')   // send that as true.
    });
    var grade = result["grade"];

    if ( grade['avg'] != undefined) {
      $('.message').addClass('hidden');
      $('.ratings').removeClass('hidden');
      if ( grade["min"] != grade["max"] ) {
        $('.ratings').text(grade["min"] + " - " + grade["max"] + "%");
      } else {
        $('.ratings').text(grade["avg"] + "%");
      }  
    } else {
      $('.message').removeClass('hidden');
      $('.ratings').addClass('hidden');
    }
    
  }

};

function changePokemon(event) {
  if ( event.target.value != "" ) {
    var pokemonDetails = dex.get(event.target.value);
    $('.cp-max-overall').text(pokemonDetails['maxCP']);
    $('.type-overall').text(function() {
      var types = "";
      for ( var i=0; i<pokemonDetails['type'].length; i++) {
        types += pokemonDetails['type'][i].replace(/\b\w/g, l => l.toUpperCase()) + " ";
      }
      return types;
    });  
  }
};

function isFormFilled() {
  return ( ($('#pokemonName').val().toString() != "") && 
    ( $('#cp').val() != "") && 
    ( $('#hp').val() != "") &&
    ( $('#stardust').val() != "")
  );
};