import React, { Component } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import MediaQuery from "react-responsive";
import theme from "../../../theme";
import FractionRow from "../FractionRow/index";
import Fraction from "../Fraction/index";
import FractionTrafficLight from "../Fraction/FractionTrafficLight";
import FractionSpeedLimit from "../Fraction/FractionSpeedLimit";
import Racer from "../../facc/Racer/index";
import TrafficLight from "../TrafficLight/index";
import { Button } from "../../../components/Button/index";
import FractionImg from "../Fraction/FractionImg";
import headings from "../Fraction/headings";

const Wrapper = styled.div`
  width:100%;
  max-width:100%:
  overflow:hidden;
  background: ${theme.midGrey};
  padding: 10px;
`;

const ButtonHolder = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 20px;
  @media screen and (max-width: 600px) {
    justify-content: center;
  }
`;
export default class RaceWrapper extends Component {
  state = {
    distance: this.props.distance,
    speedLimits: this.props.speedLimits,
    trafficLights: this.props.trafficLights,
    started: false,
    ended: false,
    elapsed: 0,
    rankings: []
  };
  static propTypes = {
    cars: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        image: PropTypes.string.isRequired,
        id: PropTypes.number.isRequired,
        description: PropTypes.string.isRequired,
        speed: PropTypes.number.isRequired
      })
    ),
    distance: PropTypes.number.isRequired,
    speedLimits: PropTypes.arrayOf(
      PropTypes.shape({
        position: PropTypes.number.isRequired,
        speed: PropTypes.number.isRequired
      })
    ),
    trafficLights: PropTypes.arrayOf(
      PropTypes.shape({
        position: PropTypes.number.isRequired,
        duration: PropTypes.number.isRequired
      })
    ),
    style: PropTypes.object
  };

  desktopFractions = 10;
  mobileFractions = 2;

  componentDidUpdate(prevProps, prevState) {
    if (this.props.trafficLights !== prevProps.trafficLights) {
      this.setState({ trafficLights: this.props.trafficLights });
    }
    if (
      this.state.rankings.length !== prevState.rankings.length &&
      this.state.rankings.length === 5
    ) {
      // Trafic lights need ended bool
      this.setState({ started: false, ended: true });
    }
  }

  addToRankings = racer =>
    this.setState(prevState => ({
      ...prevState,
      rankings: [...prevState.rankings, racer]
    }));

  getEntitiesWithFractions = ({ entityType, totalFractions }) => {
    const { distance } = this.state;
    return this.state[entityType].map((entity, i) => {
      // Fraction key is where this specific entity should be located in
      return {
        ...entity,
        fraction:
          totalFractions > this.mobileFractions
            ? parseInt(entity.position * totalFractions / distance, 10)
            : 1
      };
    });
  };

  getRacerFraction = ({ currentPosition, totalFractions }) => {
    const { distance } = this.state;
    return parseInt(currentPosition * totalFractions / distance, 10);
  };

  getRacerRank = id => {
    let rank;
    this.state.rankings.filter((racer, i) => {
      if (racer.id === id) rank = i + 1;
      return racer.id === id;
    });
    return rank;
  };
  renderRacerFractions = (
    currentPosition,
    currentCar,
    totalFractions,
    isSlowedDown,
    currentSpeed
  ) => {
    let fractions = [];

    const lightsWithFraction = this.getEntitiesWithFractions({
      totalFractions,
      entityType: "trafficLights"
    });
    const speedLimitsWithFraction = this.getEntitiesWithFractions({
      totalFractions,
      entityType: "speedLimits"
    });

    let currentFraction = this.getRacerFraction({
      currentPosition,
      totalFractions
    });

    if (currentFraction >= 10) {
      currentFraction = 9;
    }

    const parsedCurrentPosition = parseInt(currentPosition, 10);

    for (let i = 0; i < totalFractions; i++) {
      // It doesn't matter if there are any entities of that type found
      // Because here, we only attach if the indices match ⬇
      const trafficLight = lightsWithFraction.filter(
        (light, j) => light.fraction === i
      )[0];

      const speedLimits = speedLimitsWithFraction.filter(
        (speedLimit, k) => speedLimit.fraction === i
      );

      const fractionsMatch = i === currentFraction;
      const isMobile = totalFractions === 2;
      const isFractionSlowedDown = isSlowedDown && fractionsMatch;

      let rank;
      if (isMobile || currentFraction === 9)
        rank = this.getRacerRank(currentCar.id);

      const fr = (
        <Fraction
          key={i}
          index={i}
          isCar={true}
          isMobile={isMobile}
          isSlowedDown={isFractionSlowedDown}
          hasTrafficLight={!!trafficLight}
        >
          {!isMobile &&
            i === 0 &&
            currentFraction !== i && (
              <span style={{ position: "absolute", color: theme.blue }}>
                #{currentCar.id}
              </span>
            )}

          {!isMobile && (
            <FractionImg src={currentCar.image} shown={fractionsMatch} />
          )}

          {!isMobile &&
            speedLimits.length > 0 &&
            currentFraction !== 9 && (
              <FractionSpeedLimit speed={speedLimits[0].speed} />
            )}

          {!isMobile &&
            isFractionSlowedDown && (
              <span
                style={{
                  position: "absolute",
                  bottom: "5px",
                  color: "white",
                  fontSize: "0.5rem"
                }}
              >
                {currentSpeed}km/h
              </span>
            )}

          {!isMobile &&
            !!rank &&
            fractionsMatch && (
              <span
                style={{
                  position: "absolute",
                  top: "2px",
                  color: theme.blue
                }}
              >
                {rank}
              </span>
            )}

          {isMobile && <FractionImg src={currentCar.image} shown={i === 0} />}

          {!!trafficLight &&
            parsedCurrentPosition < trafficLight.position &&
            (fractionsMatch || i === 1) &&
            parsedCurrentPosition < this.state.distance && (
              <FractionTrafficLight red={trafficLight.red} />
            )}

          {isMobile &&
            !!speedLimits.length > 0 &&
            i === 1 &&
            speedLimits.map(
              (speedLimit, i) =>
                parsedCurrentPosition > speedLimit.position ? (
                  <FractionSpeedLimit key={i} speed={speedLimit.speed} />
                ) : null
            )}

          {isMobile &&
            i === 1 &&
            parsedCurrentPosition < this.state.distance && (
              <span
                style={{
                  position: "absolute",
                  bottom: "3px",
                  color: "white",
                  fontSize: "1rem"
                }}
              >
                {currentSpeed}km/h
              </span>
            )}

          {isMobile &&
            i === 1 &&
            parsedCurrentPosition < this.state.distance && (
              <span
                style={{
                  position: "absolute",
                  top: "30%",
                  color: "white",
                  fontSize: "1rem"
                }}
              >
                {parsedCurrentPosition}m
              </span>
            )}

          {isMobile &&
            !!rank &&
            i === 1 && (
              <span
                style={{
                  position: "absolute",
                  top: "30%",
                  color: theme.blue,
                  fontSize: "1.1rem"
                }}
              >
                {rank}
              </span>
            )}
        </Fraction>
      );
      fractions.push(fr);
    }
    return fractions;
  };

  renderRacers = ({ cars, fractions }) => {
    let rows = [];
    for (let i = 0; i < cars.length; i++) {
      const Row = (
        <FractionRow key={i}>
          <Racer
            id={cars[i].id}
            maxSpeed={cars[i].speed}
            started={this.state.started}
            speedLimits={this.state.speedLimits}
            trafficLights={this.state.trafficLights}
            addToRankings={this.addToRankings}
            refreshRate={100}
          >
            {(currentPosition, isSlowedDown, currentSpeed) => (
              <React.Fragment>
                {this.renderRacerFractions(
                  currentPosition,
                  cars[i],
                  fractions,
                  isSlowedDown,
                  currentSpeed
                )}
              </React.Fragment>
            )}
          </Racer>
        </FractionRow>
      );
      rows.push(Row);
    }
    return rows;
  };
  renderTableHeadings = ({ fractions }) => {
    const isMobile = fractions === 2;

    // eslint-disable-next-line
    return headings.map((heading, i) => {
      if (i <= fractions - 1) {
        return (
          <Fraction key={i} index={i} isMobile={isMobile}>
            <span className="table-heading">
              {i === 1 && isMobile ? "Position" : heading.value}
            </span>
          </Fraction>
        );
      }
    });
  };

  renderTrafficLights = ({ trafficLights }) => {
    return trafficLights.map((light, i) => (
      <TrafficLight
        started={this.state.started}
        position={light.position}
        duration={light.duration}
        red={light.red}
        toggleTrafficLight={this.toggleTrafficLight}
        ended={this.state.ended}
        key={i}
      />
    ));
  };
  toggleTrafficLight = ({ position, red }) => {
    let trafficLight = this.state.trafficLights.filter(
      (light, i) => light.position === position
    )[0];
    trafficLight.red = red;

    this.setState(prevState => ({
      ...prevState,
      trafficLights: [...this.state.trafficLights, ...trafficLight]
    }));
  };

  startRace = () =>
    this.setState(prevState => ({
      started: !prevState.started ? true : false
    }));

  render() {
    return (
      <Wrapper style={this.props.style}>
        <MediaQuery minDeviceWidth={1200}>
          {matches => {
            if (matches) {
              return (
                <React.Fragment>
                  <FractionRow>
                    {this.renderTableHeadings({
                      fractions: this.desktopFractions
                    })}
                  </FractionRow>

                  {this.renderRacers({
                    cars: this.props.cars,
                    fractions: this.desktopFractions
                  })}

                  {this.renderTrafficLights({
                    trafficLights: this.state.trafficLights,
                    fractions: this.desktopFractions
                  })}

                  <ButtonHolder>
                    <Button type="primary" onClick={this.startRace}>
                      {this.state.ended ? "START AGAIN" : "START"}
                    </Button>
                  </ButtonHolder>
                </React.Fragment>
              );
            } else {
              return (
                <React.Fragment>
                  <FractionRow>
                    {this.renderTableHeadings({
                      fractions: this.mobileFractions
                    })}
                  </FractionRow>
                  {this.renderRacers({
                    cars: this.props.cars,
                    fractions: this.mobileFractions
                  })}

                  {this.renderTrafficLights({
                    trafficLights: this.state.trafficLights,
                    fractions: this.mobileFractions
                  })}

                  <ButtonHolder>
                    <Button type="primary" onClick={this.startRace}>
                      START
                    </Button>
                  </ButtonHolder>
                </React.Fragment>
              );
            }
          }}
        </MediaQuery>
      </Wrapper>
    );
  }
}
