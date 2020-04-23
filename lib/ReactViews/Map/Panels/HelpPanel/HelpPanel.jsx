import classNames from "classnames";
import { observer } from "mobx-react";
import PropTypes from "prop-types";
import React from "react";
import { withTranslation } from "react-i18next";
import { withTheme } from "styled-components";
import Icon, { StyledIcon } from "../../../Icon.jsx";
import Styles from "./help-panel.scss";
import Spacing from "../../../../Styled/Spacing";
import Text from "../../../../Styled/Text";
import Box from "../../../../Styled/Box";
import HelpPanelItem from "./HelpPanelItem";
import { RawButton } from "../../../../Styled/Button.jsx";

@observer
class HelpPanel extends React.Component {
  static displayName = "HelpPanel";

  static propTypes = {
    terria: PropTypes.object.isRequired,
    viewState: PropTypes.object.isRequired,
    items: PropTypes.array,
    theme: PropTypes.object,
    t: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
  }

  render() {
    // const { t } = this.props;
    const helpItems = this.props.terria.configParameters.helpContent;
    const isVisible =
      this.props.viewState.showHelpMenu &&
      this.props.viewState.topElement === "HelpPanel";
    const isExpanded = this.props.viewState.helpPanelExpanded;
    const className = classNames(
      {
        [Styles.helpPanel]: true,
        [Styles.isVisible]: isVisible && !isExpanded,
        [Styles.isHidden]: !isVisible,
        [Styles.helpPanelShifted]: isVisible && isExpanded
      },
      this.props.viewState.topElement === "HelpPanel" ? "top-element" : ""
    );
    return (
      <div
        className={className}
        onClick={() => this.props.viewState.setTopElement("HelpPanel")}
      >
        <div
          css={`
            button {
              padding: 15px;
              position: absolute;
              right: 0;
              z-index: 110;
            }
          `}
        >
          <RawButton onClick={() => this.props.viewState.hideHelpPanel()}>
            <StyledIcon
              styledWidth={"16px"}
              fillColor={this.props.theme.textDark}
              opacity={"0.5"}
              glyph={Icon.GLYPHS.closeLight}
            />
          </RawButton>
        </div>
        <Box
          centered
          paddedHorizontally={5}
          paddedVertically={17}
          displayInlineBlock
          css={`
            direction: ltr;
            min-width: 295px;
            padding-bottom: 0px;
          `}
        >
          <Text extraBold heading textDark>
            We&apos;re here to help
          </Text>
          <Spacing bottom={4} />
          <Text medium textDark>
            Find useful tips on how to use the Digital Twin either by checking
            the video guides below or by contacting the team at{" "}
            <span className={Styles.link}>info@terria.io</span>.
          </Text>
          {/* <Spacing bottom={5} />
          <Box centered>
            <button
              className={Styles.tourBtn}
              title={"Take the tour"}
              // onClick={}
            >
              {" "}
              <Icon glyph={Icon.GLYPHS.tour} /> {"Take the tour"}{" "}
            </button>
          </Box> */}
        </Box>
        <Spacing bottom={10} />
        <Box centered displayInlineBlock>
          <Box displayInlineBlock>
            <For each="item" of={helpItems}>
              <HelpPanelItem
                terria={this.props.terria}
                viewState={this.props.viewState}
                iconElement={item.icon}
                itemString={item.key}
                description={item.content}
                videoLink={item.videoUrl}
                background={item.background}
              />
            </For>
            {/* {this.props.items} */}
          </Box>
        </Box>
      </div>
    );
  }
}

export default withTranslation()(withTheme(HelpPanel));
