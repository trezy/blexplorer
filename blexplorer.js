var charm, fs, noble, Table, deviceList, deviceTable, prompt, serviceTable;

charm = require( 'charm' )( process );
noble = require( 'noble' );
prompt = require( 'prompt' );
fs = require( 'fs' );
Table = require( 'cli-table' );

deviceList = {};





function blexplorer ( options ) {
  var _this;

  _this = this;

  // Create a new instance of blexplorer if we didn't already
  if ( !( this instanceof blexplorer ) ) {
    return new blexplorer( options );
  }

  // Make sure a lack of options doesn't trip us up
  if ( typeof options === 'undefined' ) {
    options = {};
  }

  // Clear the terminal
  charm.reset()

  // Create the tables if necessary
  if ( !deviceTable ) {
    deviceTable = new Table({
      head: [
        'Device Name',
        'UUID',
        'RSSI',
        'Address',
        'Power Level'
      ],
      colWidths: [
        20,
        34,
        6,
        19,
        14
      ]
    });
  }

  if ( !serviceTable ) {
    serviceTable = new Table({
      head: [
        'UUID'
        // TODO: Add fields
      ]
    });
  }

  // Clear the tables out when user kills the process
  charm.removeAllListeners( '^C' );

  charm.on( '^C', function () {
    // Erase previous deviceTable
    charm.erase( 'screen' );

    // Move cursor to top left of screen
    charm.position(0, 0);

    process.exit();
  });

  // Start scanning the bluetooth waves as soon as noble is ready
  noble.on( 'stateChange', function( state ) {
    if ( state === 'poweredOn' ) {
      noble.startScanning();
    } else {
      noble.stopScanning();
    }
  });

  // This will execute each time we find a new device
  noble.on( 'discover', function( device ) {
    var deviceDetails;

    if ( device.advertisement.localName ) {
      _this.connectToDevice( device );

      // Get dem deets
      deviceDetails = _this.getGeneralInfo( device );

      deviceList[deviceDetails.uuid] = deviceDetails;

      // Push the new device to the table
      deviceTable.push([
        deviceDetails.name,
        deviceDetails.uuid,
        deviceDetails.rssi,
        deviceDetails.address,
        deviceDetails.powerLevel
      ]);

      _this.update( deviceTable.toString() );
    };
  });
};





// TODO: Describe function
blexplorer.prototype.connectToDevice = function ( device ) {
  device.connect( function( error ){
    if ( error ) {
      return console.log( error );
    }
  });
};





// TODO: Describe function
blexplorer.prototype.getGeneralInfo = function ( device ) {
  var details, i, length;

  details = {
    name: device.advertisement.localName,
    uuid: device.uuid,
    rssi: device.rssi,
    address: device.address,
    powerLevel: device.advertisement.txPowerLevel
  };

  // The cli-table module trips up on null and undefined fields so we'll convert them to strings
  i = 0;
  length = Object.keys( details ).length;

  for ( ; i < length; i++ ) {
    key = Object.keys( details )[i];
    value = details[Object.keys( details )[i]];

    if ( value === undefined || value === null ) {
      details[key] = 'undefined';
    }
  }

  return details;
};





// TODO: Describe function
blexplorer.prototype.getDetailedInfo = function ( device ) {
//  device.discoverAllServicesAndCharacteristics(function (error, services, characteristics) {
//    var i, characteristicsLength, servicesLength;
//
//    if (error) {
//      return console.log(error);
//    }
//
//    console.log('Done.');
//
//    i = 0;
//    characteristicsLength = characteristics.length;
//    servicesLength = services.length;
//
//    for ( ; i < servicesLength; i++ ) {
//      var service;
//
//      service = services[i];
//    }
//  });
};





// Update the terminal with the new table
blexplorer.prototype.update = function ( content ) {

  // Erase previous deviceTable
  charm.position(0, 2);
  charm.erase( 'down' );

  // Print out the device deviceTable
  charm.write( content );

  // Reset the cursor position
  charm.position(0, 0);
};





new blexplorer();
