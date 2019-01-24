import React, { Component } from 'react';
import axios from 'axios';
import shuffle from 'lodash.shuffle';

import callDatas from './callDatas';

import Card from './Card';

import './board.css';

const addCounter = ({ cardTurnCounter }) => ({
  cardTurnCounter: cardTurnCounter + 1,
});

const addCardToCardsSelectedArray = id => ({ cardsSelected }) => ({
  cardsSelected: [...cardsSelected, id],
});

const updatePrecisionState = ({ cardTurnCounter, cards }) => {
  const foundCards = cards.reduce((acc, card) => acc + (card.done ? 1 : 0), 0);
  return {
    precision: Math.round((foundCards / cardTurnCounter) * 100),
  };
};

const DEFAULT_STATE = {
  cards: [],
  cardsSelected: [],
  cardTurnCounter: 0,
  win: false,
  time: '00 : 00',
  precision: 0,
};

export default class Board extends Component {
  constructor(props) {
    super(props);
    this.state = DEFAULT_STATE;
  }
  componentDidMount() {
    this.reset();
  }

  async getDatas() {
    const { data } = await callDatas;
    shuffle(data)
      .slice(0, 9)
      .map(hero =>
        this.setState({
          cards: shuffle([
            ...this.state.cards,
            { imgHero: hero.images.sm, done: false },
            { imgHero: hero.images.sm, done: false },
          ]),
        })
      );
  }

  isCardReturned(index) {
    const { cards, cardsSelected } = this.state;
    return cards[index].done || cardsSelected.includes(index);
  }

  isTwoCardsSelected = () => this.state.cardsSelected.length === 2;

  turnCard(index) {
    const { cardsSelected } = this.state;

    if (this.isCardReturned(index)) {
      return null;
    }

    this.setState(addCounter);
    if (cardsSelected.length < 2) {
      this.setState(
        addCardToCardsSelectedArray(index),
        this.checkSameCardSelected
      );
    } else if (this.isTwoCardsSelected) {
      this.setState({
        cardsSelected: [index],
      });
    }
  }

  checkSameCardSelected() {
    const { cards, cardsSelected } = this.state;
    if (this.isTwoCardsSelected) {
      const [id0, id1] = cardsSelected;

      if (cards[id0].imgHero === cards[id1].imgHero) {
        const newCards = cards.reduce((acc, card, index) => {
          const newCard =
            index === id0 || index === id1 ? { ...card, done: true } : card;
          return [...acc, newCard];
        }, []);

        this.setState({ cards: newCards }, this.checkIsWin);
      }
    }
    this.updatePrecision();
  }

  checkIsWin() {
    const win = this.state.cards.every(card => card.done);
    this.setState({
      win,
    });
    if (win) {
      this.stopTimer();
    }
  }

  updatePrecision() {
    this.setState(updatePrecisionState);
  }

  beginTimer() {
    const timeZero = Date.now();
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      const duration = Date.now() - timeZero;
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      const secondes = Math.floor((duration % (1000 * 60)) / 1000);
      this.setState({
        time: `${String(minutes).length === 2 ? minutes : '0' + minutes} : ${
          String(secondes).length === 2 ? secondes : '0' + secondes
        }`,
      });
    }, 100);
  }

  stopTimer() {
    clearInterval(this.timer);
  }

  reset() {
    this.setState(DEFAULT_STATE);
    this.getDatas();
    this.beginTimer();
  }

  render() {
    const { cards, cardTurnCounter, win, time, precision } = this.state;

    const winMessage = win ? (
      <div>
        <p>You win !</p>
        <button onClick={this.reset.bind(this)}>Play again</button>
      </div>
    ) : (
      ''
    );

    const cardsMapped = cards.map(({ imgHero, done }, index) => {
      const isTurned = this.isCardReturned(index);

      return (
        <Card
          key={index}
          img={imgHero}
          done={done}
          turn={isTurned}
          check={this.turnCard.bind(this, index)}
        />
      );
    });
    return (
      <div className="board-out">
        <div className="game-infos">
          <div className="blocInfo">{time}</div>
          <div className="blocInfo">try : {cardTurnCounter}</div>
          <div className="blocInfo">precision : {precision}%</div>
        </div>
        <div className="board">{cardsMapped}</div>
        {winMessage}
      </div>
    );
  }
}
