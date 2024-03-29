[English](README.md) | 日本語

# State Machine

[![npm version](https://badge.fury.io/js/%40working-sloth%2Fstate-machine.svg)](https://badge.fury.io/js/%40working-sloth%2Fstate-machine)
[![Build Status](https://travis-ci.org/work-work-komei/node.state-machine.svg?branch=develop)](https://travis-ci.org/work-work-komei/node.state-machine)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/03db41b395194a168573c9b647f9db24)](https://app.codacy.com/app/work-work-komei/node.state-machine?utm_source=github.com&utm_medium=referral&utm_content=work-work-komei/node.state-machine&utm_campaign=Badge_Grade_Dashboard)
[![codecov](https://codecov.io/gh/work-work-komei/node.state-machine/branch/develop/graph/badge.svg)](https://codecov.io/gh/work-work-komei/node.state-machine)
[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)

![StateMachine](samples/1.quick-start/state.png)

日々怠ける処の開発者、日没すれども帰れぬ処の社畜開発者に致す。
ステートマシンを１から作ったり貧弱なステートマシンのお世話があなたの仕事ですか？
怠けましょう
<table>
    <tr>
        <th>Poor state<br>(Before)</th>
        <td>
<pre>
if (fsm.current === 'Doing' || fsm.current === 'Waiting' || ...) {
    showProgress();
}
<br>
if (fsm.current === 'Complete') {
    showResult();
}
if (fsm.current === 'Error') {
    showError();
}
if (fsm.current === 'Cancel') {
    showCanceled();
}
...
</pre>
        </td>
    </tr>
    <tr>
        <th>Rich state<br>(After)</th>
        <td>
<pre>
if (fsm.current.inProgress) {
    showProgress();
}
<br>
fsm.current.show();
</pre>
        </td>
    </tr>
</table>

## 概要
 JavaScriptとTypeScript用のステートマシンです

## 特徴
-   読みやすい: ステートマシン定義は読みやすく、簡単に遷移を把握できます
-   ジェネリック型対応: ステート、アクション、オプション引数すべて
-   Rich state: ステートオブジェクトにユーザー定義クラスが使えます
-   ライフサイクル: 生成/破棄
-   状態遷移図のエクスポート: PlantUML
-   でも学習コストがお高いんでしょ？: 基本機能は１ステップ、Rich stateは更に２ステップ、全機能は更に３ステップのみで習得できます

## Quick start

### case: String state (最もシンプル)
```js
import { StateMachine } from '@working-sloth/state-machine';

enum SlothState {
    Idle = 'Idle',
    ...
}

enum SlothAction {
    Sleep = 'Sleep',
    ...
}

const fsm = StateMachine.fromString<SlothState, SlothAction>(
    'Sloth State', // state machine name
    SlothState.Idle, // start state
    {
        state: SlothState.Idle,
        transitions: [
            [SlothAction.Sleep, SlothState.Sleeping],
            [SlothAction.Eat, SlothState.Eating],
        ]
    }, {
        state: SlothState.Sleeping,
        transitions: [
            [SlothAction.Wake, SlothState.Idle],
        ]
    },
    ...
);

fsm.start(); // Don't forget

console.log(fsm.current); // You can get current state

if (fsm.can(SlothAction.Sleep)) {
    fsm.do(SlothAction.Sleep);
}
```

### case: Named static state (rich state)
 真に驚くべきサンプルがあるが、ここに書くには余白が狭すぎる
 [See samples](https://github.com/work-work-komei/node.state-machine.samples/tree/master/src)

### case: Typed dynamic state (ライフサイクル付きrich state)
 真に驚くべきサンプルがあるが、ここに書くには余白が狭すぎる
 [See samples](https://github.com/work-work-komei/node.state-machine.samples/tree/master/src)

## 予定
-   PlantUMLからの逆変換: 明日やる
-   ドキュメントの充実: 明日やる
-   CLIからの遷移図エクスポート: 明日やる
-   休憩: 毎日
-   おふとん: 毎日
-   有能な怠け者になる: もうすぐ
-   無能な働き者になる: 一昨日

## ご満足いただけなかった場合
-   「question」または「enhancement」として[Issueを作成](https://github.com/work-work-komei/node.data-matrix/issues)
-   e-mail：koba.work.work1127@gmail.com
