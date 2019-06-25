# State Machine

[![npm version](https://badge.fury.io/js/%40working-sloth%2Fstate-machine.svg)](https://badge.fury.io/js/%40working-sloth%2Fstate-machine)
[![Build Status](https://travis-ci.org/work-work-komei/node.state-machine.svg?branch=develop)](https://travis-ci.org/work-work-komei/node.state-machine)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/03db41b395194a168573c9b647f9db24)](https://app.codacy.com/app/work-work-komei/node.state-machine?utm_source=github.com&utm_medium=referral&utm_content=work-work-komei/node.state-machine&utm_campaign=Badge_Grade_Dashboard)
[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)

![StateMachine](https://github.com/work-work-komei/node.state-machine/blob/develop/samples/SlothState.png)

Note: This version is beta.

## Functions
 - Provide rich state machine
 - Export state machine as text (ex. PlantUML)

## Quick start
 See samples: https://github.com/work-work-komei/node.state-machine/tree/develop/samples
```js
import { StateMachine } from '@working-sloth/state-machine';


const fsm = StateMachine.fromString(
    'Sloth State', // state machine name
    SlothState.Idle, // start state
    {
    }
);
```

## Schedule
 - State nesting: someday
 - Check coverage: someday
 - Crate docs: someday
 - Release v1.0: someday
 - Rest: every day
 - Sleep: every day
 - Be clever and lazy: soon
 - Be stupid and diligent: never
