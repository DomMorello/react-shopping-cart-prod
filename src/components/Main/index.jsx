import React from "react";
import { Route, Routes } from "react-router-dom";
import styled from "styled-components";

import ProductListPage from "./ProductListPage";
import ProductDetailPage from "./ProductDetailPage";
import ProductCartPage from "./ShoppingCartPage";
import OrderListPage from "./OrderListPage";

const Container = styled.main`
  display: flex;
  justify-content: center;
  align-items: center;

  max-width: 1320px;
  margin: 140px auto 60px;

  height: calc(100vh - 200px);
`;

function Main() {
  return (
    <Container>
      <Routes>
        <Route exact path="/" element={<ProductListPage />} />
        <Route exact path="/product-list" element={<ProductListPage />} />
        <Route
          exact
          path="/product-detail/:id"
          element={<ProductDetailPage />}
        />
        <Route exact path="/product-cart" element={<ProductCartPage />} />
        <Route exact path="/order-list" element={<OrderListPage />} />
        <Route path="*" element={<div>잘못된 접근입니다.</div>} />
      </Routes>
    </Container>
  );
}

export default Main;
