
var Module;

if (typeof Module === 'undefined') Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;
(function() {
 var loadPackage = function(metadata) {

    var PACKAGE_PATH;
    if (typeof window === 'object') {
      PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    } else if (typeof location !== 'undefined') {
      // worker
      PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
    } else {
      throw 'using preloaded data can only be done on a web page or in a web worker';
    }
    var PACKAGE_NAME = 'game.data';
    var REMOTE_PACKAGE_BASE = 'game.data';
    if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
      Module['locateFile'] = Module['locateFilePackage'];
      Module.printErr('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
    }
    var REMOTE_PACKAGE_NAME = typeof Module['locateFile'] === 'function' ?
                              Module['locateFile'](REMOTE_PACKAGE_BASE) :
                              ((Module['filePackagePrefixURL'] || '') + REMOTE_PACKAGE_BASE);
  
    var REMOTE_PACKAGE_SIZE = metadata.remote_package_size;
    var PACKAGE_UUID = metadata.package_uuid;
  
    function fetchRemotePackage(packageName, packageSize, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', packageName, true);
      xhr.responseType = 'arraybuffer';
      xhr.onprogress = function(event) {
        var url = packageName;
        var size = packageSize;
        if (event.total) size = event.total;
        if (event.loaded) {
          if (!xhr.addedTotal) {
            xhr.addedTotal = true;
            if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
            Module.dataFileDownloads[url] = {
              loaded: event.loaded,
              total: size
            };
          } else {
            Module.dataFileDownloads[url].loaded = event.loaded;
          }
          var total = 0;
          var loaded = 0;
          var num = 0;
          for (var download in Module.dataFileDownloads) {
          var data = Module.dataFileDownloads[download];
            total += data.total;
            loaded += data.loaded;
            num++;
          }
          total = Math.ceil(total * Module.expectedDataFileDownloads/num);
          if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
        } else if (!Module.dataFileDownloads) {
          if (Module['setStatus']) Module['setStatus']('Downloading data...');
        }
      };
      xhr.onload = function(event) {
        var packageData = xhr.response;
        callback(packageData);
      };
      xhr.send(null);
    };

    function handleError(error) {
      console.error('package error:', error);
    };
  
      var fetched = null, fetchedCallback = null;
      fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
        if (fetchedCallback) {
          fetchedCallback(data);
          fetchedCallback = null;
        } else {
          fetched = data;
        }
      }, handleError);
    
  function runWithFS() {

    function assert(check, msg) {
      if (!check) throw msg + new Error().stack;
    }
Module['FS_createPath']('/', 'fonts', true, true);
Module['FS_createPath']('/fonts', 'arcade_alternate', true, true);
Module['FS_createPath']('/fonts', 'fipps', true, true);
Module['FS_createPath']('/', 'graphics', true, true);
Module['FS_createPath']('/', 'lib', true, true);
Module['FS_createPath']('/lib', 'knife', true, true);
Module['FS_createPath']('/', 'sounds', true, true);
Module['FS_createPath']('/', 'src', true, true);
Module['FS_createPath']('/src', 'states', true, true);
Module['FS_createPath']('/src/states', 'entity', true, true);
Module['FS_createPath']('/src/states/entity', 'snail', true, true);
Module['FS_createPath']('/src/states', 'game', true, true);

    function DataRequest(start, end, crunched, audio) {
      this.start = start;
      this.end = end;
      this.crunched = crunched;
      this.audio = audio;
    }
    DataRequest.prototype = {
      requests: {},
      open: function(mode, name) {
        this.name = name;
        this.requests[name] = this;
        Module['addRunDependency']('fp ' + this.name);
      },
      send: function() {},
      onload: function() {
        var byteArray = this.byteArray.subarray(this.start, this.end);

          this.finish(byteArray);

      },
      finish: function(byteArray) {
        var that = this;

        Module['FS_createDataFile'](this.name, null, byteArray, true, true, true); // canOwn this data in the filesystem, it is a slide into the heap that will never change
        Module['removeRunDependency']('fp ' + that.name);

        this.requests[this.name] = null;
      },
    };

        var files = metadata.files;
        for (i = 0; i < files.length; ++i) {
          new DataRequest(files[i].start, files[i].end, files[i].crunched, files[i].audio).open('GET', files[i].filename);
        }

  
    function processPackageData(arrayBuffer) {
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      assert(arrayBuffer instanceof ArrayBuffer, 'bad input to processPackageData');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;
      
        // copy the entire loaded file into a spot in the heap. Files will refer to slices in that. They cannot be freed though
        // (we may be allocating before malloc is ready, during startup).
        if (Module['SPLIT_MEMORY']) Module.printErr('warning: you should run the file packager with --no-heap-copy when SPLIT_MEMORY is used, otherwise copying into the heap may fail due to the splitting');
        var ptr = Module['getMemory'](byteArray.length);
        Module['HEAPU8'].set(byteArray, ptr);
        DataRequest.prototype.byteArray = Module['HEAPU8'].subarray(ptr, ptr+byteArray.length);
  
          var files = metadata.files;
          for (i = 0; i < files.length; ++i) {
            DataRequest.prototype.requests[files[i].filename].onload();
          }
              Module['removeRunDependency']('datafile_game.data');

    };
    Module['addRunDependency']('datafile_game.data');
  
    if (!Module.preloadResults) Module.preloadResults = {};
  
      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      if (fetched) {
        processPackageData(fetched);
        fetched = null;
      } else {
        fetchedCallback = processPackageData;
      }
    
  }
  if (Module['calledRun']) {
    runWithFS();
  } else {
    if (!Module['preRun']) Module['preRun'] = [];
    Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
  }

 }
 loadPackage({"files": [{"audio": 0, "start": 0, "crunched": 0, "end": 6148, "filename": "/.DS_Store"}, {"audio": 0, "start": 6148, "crunched": 0, "end": 8012, "filename": "/main.lua"}, {"audio": 0, "start": 8012, "crunched": 0, "end": 14160, "filename": "/fonts/.DS_Store"}, {"audio": 0, "start": 14160, "crunched": 0, "end": 33134, "filename": "/fonts/arcade_alternate.zip"}, {"audio": 0, "start": 33134, "crunched": 0, "end": 75418, "filename": "/fonts/ArcadeAlternate.ttf"}, {"audio": 0, "start": 75418, "crunched": 0, "end": 109638, "filename": "/fonts/fipps.otf"}, {"audio": 0, "start": 109638, "crunched": 0, "end": 173700, "filename": "/fonts/fipps.zip"}, {"audio": 0, "start": 173700, "crunched": 0, "end": 193192, "filename": "/fonts/font.ttf"}, {"audio": 0, "start": 193192, "crunched": 0, "end": 199340, "filename": "/fonts/arcade_alternate/.DS_Store"}, {"audio": 0, "start": 199340, "crunched": 0, "end": 199618, "filename": "/fonts/arcade_alternate/ReadMe.txt"}, {"audio": 0, "start": 199618, "crunched": 0, "end": 205766, "filename": "/fonts/fipps/.DS_Store"}, {"audio": 0, "start": 205766, "crunched": 0, "end": 423579, "filename": "/fonts/fipps/pheist_license_freeware.pdf"}, {"audio": 0, "start": 423579, "crunched": 0, "end": 429727, "filename": "/graphics/.DS_Store"}, {"audio": 0, "start": 429727, "crunched": 0, "end": 432424, "filename": "/graphics/backgrounds.png"}, {"audio": 0, "start": 432424, "crunched": 0, "end": 433925, "filename": "/graphics/blue_alien.png"}, {"audio": 0, "start": 433925, "crunched": 0, "end": 436137, "filename": "/graphics/bushes_and_cacti.png"}, {"audio": 0, "start": 436137, "crunched": 0, "end": 437547, "filename": "/graphics/buttons.png"}, {"audio": 0, "start": 437547, "crunched": 0, "end": 438922, "filename": "/graphics/coins_and_bombs.png"}, {"audio": 0, "start": 438922, "crunched": 0, "end": 440499, "filename": "/graphics/crates_and_blocks.png"}, {"audio": 0, "start": 440499, "crunched": 0, "end": 443310, "filename": "/graphics/creatures.png"}, {"audio": 0, "start": 443310, "crunched": 0, "end": 445364, "filename": "/graphics/doors_and_windows.png"}, {"audio": 0, "start": 445364, "crunched": 0, "end": 447189, "filename": "/graphics/faces_and_hills.png"}, {"audio": 0, "start": 447189, "crunched": 0, "end": 449277, "filename": "/graphics/fireballs.png"}, {"audio": 0, "start": 449277, "crunched": 0, "end": 451237, "filename": "/graphics/flags.png"}, {"audio": 0, "start": 451237, "crunched": 0, "end": 519681, "filename": "/graphics/full_sheet.png"}, {"audio": 0, "start": 519681, "crunched": 0, "end": 521109, "filename": "/graphics/gems.png"}, {"audio": 0, "start": 521109, "crunched": 0, "end": 522603, "filename": "/graphics/green_alien.png"}, {"audio": 0, "start": 522603, "crunched": 0, "end": 524001, "filename": "/graphics/hearts.png"}, {"audio": 0, "start": 524001, "crunched": 0, "end": 526095, "filename": "/graphics/jump_blocks.png"}, {"audio": 0, "start": 526095, "crunched": 0, "end": 527548, "filename": "/graphics/keys_and_locks.png"}, {"audio": 0, "start": 527548, "crunched": 0, "end": 529710, "filename": "/graphics/ladders_and_signs.png"}, {"audio": 0, "start": 529710, "crunched": 0, "end": 532262, "filename": "/graphics/mushrooms.png"}, {"audio": 0, "start": 532262, "crunched": 0, "end": 533498, "filename": "/graphics/numbers.png"}, {"audio": 0, "start": 533498, "crunched": 0, "end": 535002, "filename": "/graphics/pink_alien.png"}, {"audio": 0, "start": 535002, "crunched": 0, "end": 556129, "filename": "/graphics/tile_tops.png"}, {"audio": 0, "start": 556129, "crunched": 0, "end": 572649, "filename": "/graphics/tiles.png"}, {"audio": 0, "start": 572649, "crunched": 0, "end": 574175, "filename": "/graphics/water.png"}, {"audio": 0, "start": 574175, "crunched": 0, "end": 580323, "filename": "/lib/.DS_Store"}, {"audio": 0, "start": 580323, "crunched": 0, "end": 583389, "filename": "/lib/class.lua"}, {"audio": 0, "start": 583389, "crunched": 0, "end": 590618, "filename": "/lib/push.lua"}, {"audio": 0, "start": 590618, "crunched": 0, "end": 591038, "filename": "/lib/knife/base.lua"}, {"audio": 0, "start": 591038, "crunched": 0, "end": 592850, "filename": "/lib/knife/behavior.lua"}, {"audio": 0, "start": 592850, "crunched": 0, "end": 593617, "filename": "/lib/knife/bind.lua"}, {"audio": 0, "start": 593617, "crunched": 0, "end": 594342, "filename": "/lib/knife/chain.lua"}, {"audio": 0, "start": 594342, "crunched": 0, "end": 595660, "filename": "/lib/knife/convoke.lua"}, {"audio": 0, "start": 595660, "crunched": 0, "end": 598109, "filename": "/lib/knife/event.lua"}, {"audio": 0, "start": 598109, "crunched": 0, "end": 598140, "filename": "/lib/knife/gun.lua"}, {"audio": 0, "start": 598140, "crunched": 0, "end": 600101, "filename": "/lib/knife/memoize.lua"}, {"audio": 0, "start": 600101, "crunched": 0, "end": 602435, "filename": "/lib/knife/serialize.lua"}, {"audio": 0, "start": 602435, "crunched": 0, "end": 604599, "filename": "/lib/knife/system.lua"}, {"audio": 0, "start": 604599, "crunched": 0, "end": 608094, "filename": "/lib/knife/test.lua"}, {"audio": 0, "start": 608094, "crunched": 0, "end": 612977, "filename": "/lib/knife/timer.lua"}, {"audio": 1, "start": 612977, "crunched": 0, "end": 697859, "filename": "/sounds/death.wav"}, {"audio": 1, "start": 697859, "crunched": 0, "end": 712269, "filename": "/sounds/empty-block.wav"}, {"audio": 1, "start": 712269, "crunched": 0, "end": 739283, "filename": "/sounds/jump.wav"}, {"audio": 1, "start": 739283, "crunched": 0, "end": 753069, "filename": "/sounds/kill.wav"}, {"audio": 1, "start": 753069, "crunched": 0, "end": 772817, "filename": "/sounds/kill2.wav"}, {"audio": 1, "start": 772817, "crunched": 0, "end": 19009963, "filename": "/sounds/music.wav"}, {"audio": 1, "start": 19009963, "crunched": 0, "end": 19044607, "filename": "/sounds/pickup.wav"}, {"audio": 1, "start": 19044607, "crunched": 0, "end": 19091901, "filename": "/sounds/powerup-reveal.wav"}, {"audio": 0, "start": 19091901, "crunched": 0, "end": 19098049, "filename": "/src/.DS_Store"}, {"audio": 0, "start": 19098049, "crunched": 0, "end": 19098785, "filename": "/src/Animation.lua"}, {"audio": 0, "start": 19098785, "crunched": 0, "end": 19100311, "filename": "/src/constants.lua"}, {"audio": 0, "start": 19100311, "crunched": 0, "end": 19103766, "filename": "/src/Dependencies.lua"}, {"audio": 0, "start": 19103766, "crunched": 0, "end": 19105013, "filename": "/src/Entity.lua"}, {"audio": 0, "start": 19105013, "crunched": 0, "end": 19106127, "filename": "/src/GameLevel.lua"}, {"audio": 0, "start": 19106127, "crunched": 0, "end": 19107015, "filename": "/src/GameObject.lua"}, {"audio": 0, "start": 19107015, "crunched": 0, "end": 19113006, "filename": "/src/LevelMaker.lua"}, {"audio": 0, "start": 19113006, "crunched": 0, "end": 19115416, "filename": "/src/Player.lua"}, {"audio": 0, "start": 19115416, "crunched": 0, "end": 19115879, "filename": "/src/Snail.lua"}, {"audio": 0, "start": 19115879, "crunched": 0, "end": 19116519, "filename": "/src/StateMachine.lua"}, {"audio": 0, "start": 19116519, "crunched": 0, "end": 19117578, "filename": "/src/Tile.lua"}, {"audio": 0, "start": 19117578, "crunched": 0, "end": 19118481, "filename": "/src/TileMap.lua"}, {"audio": 0, "start": 19118481, "crunched": 0, "end": 19121522, "filename": "/src/Util.lua"}, {"audio": 0, "start": 19121522, "crunched": 0, "end": 19127670, "filename": "/src/states/.DS_Store"}, {"audio": 0, "start": 19127670, "crunched": 0, "end": 19128367, "filename": "/src/states/BaseState.lua"}, {"audio": 0, "start": 19128367, "crunched": 0, "end": 19131591, "filename": "/src/states/entity/PlayerFallingState.lua"}, {"audio": 0, "start": 19131591, "crunched": 0, "end": 19132467, "filename": "/src/states/entity/PlayerIdleState.lua"}, {"audio": 0, "start": 19132467, "crunched": 0, "end": 19135162, "filename": "/src/states/entity/PlayerJumpState.lua"}, {"audio": 0, "start": 19135162, "crunched": 0, "end": 19137373, "filename": "/src/states/entity/PlayerWalkingState.lua"}, {"audio": 0, "start": 19137373, "crunched": 0, "end": 19139373, "filename": "/src/states/entity/snail/SnailChasingState.lua"}, {"audio": 0, "start": 19139373, "crunched": 0, "end": 19140347, "filename": "/src/states/entity/snail/SnailIdleState.lua"}, {"audio": 0, "start": 19140347, "crunched": 0, "end": 19143647, "filename": "/src/states/entity/snail/SnailMovingState.lua"}, {"audio": 0, "start": 19143647, "crunched": 0, "end": 19148593, "filename": "/src/states/game/PlayState.lua"}, {"audio": 0, "start": 19148593, "crunched": 0, "end": 19149998, "filename": "/src/states/game/StartState.lua"}], "remote_package_size": 19149998, "package_uuid": "0239238a-9ca8-444c-bd3d-ca5e2023eff7"});

})();
