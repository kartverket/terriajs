"use strict";

import classNames from "classnames";
import createReactClass from "create-react-class";
import { runInAction } from "mobx";
import { observer } from "mobx-react";
import PropTypes from "prop-types";
import React from "react";
import { sortable } from "react-anything-sortable";
import { withTranslation } from "react-i18next";
import getPath from "../../Core/getPath";
import CatalogMemberMixin from "../../ModelMixins/CatalogMemberMixin";
import ReferenceMixin from "../../ModelMixins/ReferenceMixin";
import CommonStrata from "../../Models/Definition/CommonStrata";
import { DEFAULT_PLACEMENT } from "../../Models/SelectableDimensions";
import Box from "../../Styled/Box";
import Icon from "../../Styled/Icon";
import Loader from "../Loader";
import PrivateIndicator from "../PrivateIndicator/PrivateIndicator";
import ChartItemSelector from "./Controls/ChartItemSelector";
import ColorScaleRangeSection from "./Controls/ColorScaleRangeSection";
import DateTimeSelectorSection from "./Controls/DateTimeSelectorSection";
import DimensionSelectorSection from "./Controls/DimensionSelectorSection";
import FilterSection from "./Controls/FilterSection";
import LeftRightSection from "./Controls/LeftRightSection";
import Legend from "./Controls/Legend";
import OpacitySection from "./Controls/OpacitySection";
import SatelliteImageryTimeFilterSection from "./Controls/SatelliteImageryTimeFilterSection";
import { ScaleWorkbenchInfo } from "./Controls/ScaleWorkbenchInfo";
import ShortReport from "./Controls/ShortReport";
import TimerSection from "./Controls/TimerSection";
import ViewingControls from "./Controls/ViewingControls";
import Styles from "./workbench-item.scss";

export const WorkbenchItemRaw = observer(
  createReactClass({
    displayName: "WorkbenchItem",

    propTypes: {
      style: PropTypes.object,
      className: PropTypes.string,
      onMouseDown: PropTypes.func.isRequired,
      onTouchStart: PropTypes.func.isRequired,
      item: PropTypes.object.isRequired,
      viewState: PropTypes.object.isRequired,
      setWrapperState: PropTypes.func,
      t: PropTypes.func.isRequired
    },

    toggleDisplay() {
      runInAction(() => {
        this.props.item.setTrait(
          CommonStrata.user,
          "isOpenInWorkbench",
          !this.props.item.isOpenInWorkbench
        );
      });
    },

    openModal() {
      this.props.setWrapperState({
        modalWindowIsOpen: true,
        activeTab: 1,
        previewed: this.props.item
      });
    },

    toggleVisibility() {
      runInAction(() => {
        this.props.item.setTrait(
          CommonStrata.user,
          "show",
          !this.props.item.show
        );
      });
    },

    render() {
      const workbenchItem = this.props.item;
      const { t } = this.props;
      const isLoading =
        (CatalogMemberMixin.isMixedInto(this.props.item) &&
          this.props.item.isLoading) ||
        (ReferenceMixin.isMixedInto(this.props.item) &&
          this.props.item.isLoadingReference);
      return (
        <li
          style={this.props.style}
          className={classNames(this.props.className, Styles.workbenchItem, {
            [Styles.isOpen]: workbenchItem.isOpenInWorkbench
          })}
          css={`
            color: ${p => p.theme.textLight};
            background: ${p => p.theme.darkWithOverlay};
          `}
        >
          <Box fullWidth justifySpaceBetween padded>
            <Box>
              <If condition={true || workbenchItem.supportsToggleShown}>
                <Box
                  leftSelf
                  className={Styles.visibilityColumn}
                  css={`
                    padding: 3px 5px;
                  `}
                >
                  <button
                    type="button"
                    onClick={this.toggleVisibility}
                    title={t("workbench.toggleVisibility")}
                    className={Styles.btnVisibility}
                  >
                    {workbenchItem.show ? (
                      <Icon glyph={Icon.GLYPHS.checkboxOn} />
                    ) : (
                      <Icon glyph={Icon.GLYPHS.checkboxOff} />
                    )}
                  </button>
                </Box>
              </If>
            </Box>
            <Box className={Styles.nameColumn}>
              <Box fullWidth paddedHorizontally>
                <div
                  onMouseDown={this.props.onMouseDown}
                  onTouchStart={this.props.onTouchStart}
                  className={Styles.draggable}
                  title={getPath(workbenchItem, " → ")}
                >
                  <If condition={!workbenchItem.isMappable && !isLoading}>
                    <span className={Styles.iconLineChart}>
                      <Icon glyph={Icon.GLYPHS.lineChart} />
                    </span>
                  </If>
                  {workbenchItem.name}
                </div>
              </Box>
            </Box>
            <Box>
              <Box className={Styles.toggleColumn} alignItemsFlexStart>
                <button
                  type="button"
                  className={Styles.btnToggle}
                  onClick={this.toggleDisplay}
                  css={`
                    display: flex;
                    min-height: 24px;
                    align-items: center;
                    padding: 5px;
                  `}
                >
                  {workbenchItem.isPrivate && (
                    <Box paddedHorizontally>
                      <PrivateIndicator inWorkbench />
                    </Box>
                  )}
                  {workbenchItem.isOpenInWorkbench ? (
                    <Icon glyph={Icon.GLYPHS.opened} />
                  ) : (
                    <Icon glyph={Icon.GLYPHS.closed} />
                  )}
                </button>
              </Box>
              <div className={Styles.headerClearfix} />
            </Box>
          </Box>

          <If condition={workbenchItem.isOpenInWorkbench}>
            <div className={Styles.inner}>
              <ViewingControls
                item={workbenchItem}
                viewState={this.props.viewState}
              />
              <OpacitySection item={workbenchItem} />
              <ScaleWorkbenchInfo item={workbenchItem} />
              <LeftRightSection item={workbenchItem} />
              <TimerSection item={workbenchItem} />
              <ChartItemSelector item={workbenchItem} />
              <FilterSection item={workbenchItem} />
              <DateTimeSelectorSection item={workbenchItem} />
              <SatelliteImageryTimeFilterSection item={workbenchItem} />
              <DimensionSelectorSection
                item={workbenchItem}
                placement={DEFAULT_PLACEMENT}
              />
              <ColorScaleRangeSection
                item={workbenchItem}
                minValue={workbenchItem.colorScaleMinimum}
                maxValue={workbenchItem.colorScaleMaximum}
              />
              <If
                condition={
                  workbenchItem.shortReport ||
                  (workbenchItem.shortReportSections &&
                    workbenchItem.shortReportSections.length)
                }
              >
                <ShortReport item={workbenchItem} />
              </If>
              <Legend item={workbenchItem} />
              <DimensionSelectorSection
                item={workbenchItem}
                placement={"belowLegend"}
              />
              {isLoading ? (
                <Box paddedVertically>
                  <Loader light />
                </Box>
              ) : null}
            </div>
          </If>
        </li>
      );
    }
  })
);

export default sortable(withTranslation()(WorkbenchItemRaw));
