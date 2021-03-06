/* eslint-disable no-use-before-define */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Layout, Row, Button, BackTop } from "antd";
import debounce from "lodash.debounce";
import GifCard from "./components/GifCard";
import Header from "./components/Header/Header";
import gifService from "./services/index";
import toast from "./utils/toaster";

const { Content } = Layout;

const App = () => {
  const [data, setData] = useState([]);
  const [searchValue, setSearchValue] = useState(null);
  const [offset, setOffset] = useState(0);
  const [isSearch, setIsSearch] = useState(false);

  useEffect(() => {
    handleLoadData();
    window.onscroll = debounce(() => {
      if (
        window.innerHeight + document.documentElement.scrollTop ===
          document.documentElement.offsetHeight &&
        !isSearch
      ) {
        handleLoadData();
      }
    }, 100);
  }, [isSearch]);

  // Reset the states on each search
  const handleResetStates = () => {
    setIsSearch(true);
    setData([]);
    setOffset(20);
  };

  // Triggered when component initialized && user reaches bottom of the screen
  const handleLoadData = async () => {
    if (!isSearch) {
      try {
        const res = await gifService.fetchGifs(offset);
        setData((prevData) => prevData.concat(res.data.data));
        setOffset((prevOffSet) => prevOffSet + 20);
      } catch (err) {
        toast.error(err);
      }
    }
  };

  // Get user specific searched gifs
  const getSearchData = (responseArr, searchValue) => {
    setData((prevData) => []);
    setData((prevData) => prevData.concat(responseArr.data));
    setSearchValue(searchValue);
  };

  // Triggered if user clicks 'Load More' button
  const handleLoadMoreGifs = async () => {
    try {
      const res = await gifService.fetchMoreGifs(searchValue, offset);
      setData((prevData) => prevData.concat(res.data.data));
      setOffset(20);
    } catch (err) {
      toast.error(err);
    }
  };

  const handleDisplayTrends = () => {
    setOffset(0);
    setData([]);
    setIsSearch(false);
    handleLoadData();
  };

  return (
    <Layout>
      <BackTop />
      <Content>
        <Header
          handleResetStates={handleResetStates}
          getSearchData={getSearchData}
          isSearch={isSearch}
          handleDisplayTrends={handleDisplayTrends}
        />
        {data.length <= 0 ? (
          <p>Loading..</p>
        ) : (
          <Row type="flex" className="gif-card-parent">
            {data.map((value, index) => (
              <GifCard
                key={index}
                originalUrl={value.images.original.url}
                id={index}
                title={value.title}
                webUrl={value.url}
              />
            ))}
          </Row>
        )}
        {isSearch ? (
          <Row type="flex" justify="center" className="button-props">
            <Button
              type="primary"
              shape="round"
              icon="plus-circle"
              size="large"
              onClick={handleLoadMoreGifs}
            >
              Load More
            </Button>
          </Row>
        ) : null}
      </Content>
    </Layout>
  );
};

export default App;
