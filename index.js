#!/usr/bin/env node
'use strict';

var readline = require('readline');

var expected_entries = process.argv[2];

var read_timeseries = function(callback)
{
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    // Currently being-built timeseries
    var curts = {};

    var line_nr = 0;
    var state = 0;
    rl.on('line', function(line)
    {
        line_nr++;

        if(state == 0)
        {
            var array = line.split(" ");
            if(array.length != 2)
            {
                console.error("Fatal Error: Invalid formatted job-file; Header string malformed");
                console.error("\tLine:", line_nr);
                console.error("\tExpected:", 2);
                console.error("\tFound:", array.length);
                process.exit(1);
            }
            /*
            curts.tag = array[0];
            curts.uid = array[1];
            */
        }
        else if(state == 1)
        {
            curts.ret_time = line;
        }
        else
        {
            curts.abs_time = line;

            var num_spaces = function(string)
            {
                var acc = 0;
                for (var i=0; i < string.length; i++) 
                { 
                    acc += string.charAt(i) == ' ' ? 1 : 0; 
                }
                return acc;
            }

            var ret_spaces = num_spaces(curts.ret_time);
            var abs_spaces = num_spaces(curts.abs_time);

            if(curts.ret_time.length == 0 || curts.abs_time == 0)
            {
                console.error("Fatal Error: Invalid formatted job-file; Empty lines");
                console.error("\tLine:", line_nr);
                process.exit(1);
            }
            else if(ret_spaces != abs_spaces)
            {
                console.error("Fatal Error: Invalid formatted job-file; Unbalanced");
                console.error("\tLine:", line_nr);
                console.error("\tRelative:", ret_spaces);
                console.error("\tAbsolute:", abs_spaces);
                process.exit(1);
            }
            else if(expected_entries != undefined && expected_entries != ret_spaces)
            {
                console.error("Fatal Error: Invalid formatted job-file; Missing data");
                console.error("\tLine:", line_nr);
                console.error("\tExpected:", expected_entries);
                console.error("\tFound:", ret_spaces);
                process.exit(1);
            }
            
            curts = {};
        }
        
        state = (state + 1) % 3;
    });

    rl.on('close', function()
    {
        var is_empty = function(obj)
        {
            return Object.keys(obj).length === 0 && obj.constructor === Object
        }
        if(is_empty(curts) == false)
        {
            console.error("Fatal Error: Invalid formatted job-file; Bad line count");
            console.error("\tLine:", line_nr);
            console.error("\tState:", state);
            process.exit(1);
        }
        callback();
    });
}

// Process our input, into JSON
read_timeseries(function()
{
    console.log("Jobfile valid!");
});
