import React, { useState } from "react";
import { Form, Modal, Input, Select, Button, Row, Col, Spin, message, Popconfirm } from "antd";
import MyPagination from "@/components/pagination";
import MyTable from "@/components/table";
import PersonApplyModal from '@/components/modal/personApply'
import { getKey } from "@/utils";
import { getPersonApplyList, delApply, checkPersonApply } from "@/api";

import "./index.less";

const { Option } = Select;

export default function SearchPage() {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [pageData, setPageData] = useState({ curPage: 1 });
  const [tableData, setData] = useState([]);
  const [tableCol, setCol] = useState([]);
  const [load, setLoad] = useState(true);
  const [total, setTotal] = useState(0);
  const [showModal, setShow] = useState(false);
  const [editId, setId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [showCheckModal, setCheck] = useState(false);
  const [checkData, setCheckData] = useState(null);
  const [userInfoData, setUserInfoData] = useState(null);
  // 显示弹窗
  const showInfoModal = (record, type) => {
    if (record) {
      debugger
      setId(record.id);
      setEditData(record)
    } else {
      setId(null);
      setEditData(null)
    }
    setShow(type);
  };

  // 获取列表
  const getDataList = (data) => {
    let userInfo = getKey(true, 'USER_INFO')
    console.log('SDFSAGSAG',userInfo)
    if(userInfo.role === 1) {
      data.uId = -1
    } else {
      data.uId = userInfo.id
    }
    getPersonApplyList(data).then((res) => {
      const { data, code, count} = res;
      if (code === 200) {
        // let { list, total, mapKey } = data;
        // mapKey = mapKey.map((i) => {
        //   if (i.key === "description") {
        //     i.width = 500;
        //   }
        //   return i;
        // });

        let list = data 
        let total = count

        let columns= [
          {
            dataIndex: "id",
            key: "id",
            title: "序号",
          }, {
            dataIndex: "name",
            key: "name",
            title: "用户姓名",
          }, {
            dataIndex: "phone",
            key: "phone",
            title: "用户电话",
          }, {
            dataIndex: "content",
            key: "content",
            title: "申请项目",
          }, {
            dataIndex: "memo",
            key: "memo",
            title: "申请内容",
          },{
            dataIndex: "ifAduit",
            key: "ifAduit",
            title: "申请状态",
            render: function(text) {
              if (text === 0) {
                return '审核中'
              } else if(text === 1) {
                return '已通过' 
              } else {
                return '未通过' 
              }
            }
          }, {
            dataIndex: "createTime",
            key: "createTime",
            title: "添加时间",
          }
        ]
        let userInfo = getKey(true, 'USER_INFO')
        setUserInfoData(userInfo)
        const activeCol = {
          dataIndex: "active",
          key: "active",
          title: "操作",
          align: "center",
          render: (text, record) => (
            <Row>
             
              { userInfo && userInfo.role ? '' : <Button type="link" onClick={() => showInfoModal(record, true)}>
                编辑
              </Button> }
              { userInfo && userInfo.role ? '' : <Popconfirm
                onConfirm={() => deleteApply(record)}
                okText="确认"
                title="确认删除此条申请？"
                cancelText="取消"
              >
                <Button type="link" danger>
                  删除
                </Button>
              </Popconfirm> }
              { userInfo && userInfo.role ? <Button type="link" onClick={() => setCheckModal(record, true)}>
                审核
              </Button> : ''}
            </Row>
          ),
        };
        columns.push(activeCol) // 添加操作按钮
        setCol(columns);
        setTotal(total);
        setData(list.map((i) => ({ ...i, key: i.m_id })));
        setLoad(false);
        return;
      }
    });
  };

  // 顶部搜索
  const search = (isSearch) => {
    setPageData({ curPage: 1 });
    let data = searchForm.getFieldsValue();
    let params = { ...data };
    if (!isSearch) {
      params = { ...params, ...pageData };
    }
    getDataList(params);
  };

  // 页码改版
  const pageChange = (pageData) => {
    let data = searchForm.getFieldsValue();
    getDataList({ ...pageData, ...data });
    setPageData(pageData);
  };

  const tableTop = (
    <Row justify="space-between" align="center" gutter={80}>
      <Col style={{ lineHeight: "32px" }}>申请查询</Col>
      <Col>
       { userInfoData && userInfoData.role === 1 ? '' : <Button type="primary" onClick={() => setShow(true)}>
          用户申请
        </Button> }
      </Col>
    </Row>
  );

  const updatePropertyData = () => {
    getDataList(pageData);
  };



  // 删除档案信息
  const deleteApply = (info) => {
    delApply(info.id).then((res) => {
      const { msg, code } = res;
      if (code === 200) {
        message.success(msg);
        getDataList(pageData);
      }
    });
  };

  const addCheck = () => {
    let data = form.getFieldsValue();
    console.log( 'form： ', data)

    let vals = {
      'ifAduit': parseInt(data.ifAduit),
      'id': checkData.id
    }

    checkPersonApply(vals).then(res => {
      const { msg, code } = res;
      if (code === 200) {
        setCheck(false);
        message.success(msg);
        getDataList(pageData);
      } else {
        message.error(msg);
      }
    })

    console.log(vals)
  };

   // 显示弹窗
   const setCheckModal = (record, type) => {
    setCheckData(record)
    setCheck(type);
  };

  return (
    <div className="search-container">
      <Spin spinning={load}>
        <div className="top-form">
          <Form layout="inline" form={searchForm}>
            <Form.Item name="name">
              <Input placeholder="输入用户名" />
            </Form.Item>
            {/* <Form.Item name="description">
              <Input placeholder="输入消息描述词" />
            </Form.Item> */}
            <Button onClick={search} type="primary" className="submit-btn">
              搜索
            </Button>
            <Button
              onClick={() => {
                searchForm.resetFields();
                search();
              }}
            >
              清空
            </Button>
          </Form>
        </div>
        <MyTable
          title={() => tableTop}
          dataSource={tableData}
          columns={tableCol}
          pagination={false}
          saveKey="listForm"
          rowKey="id"
        />
        <MyPagination
          curPage={pageData.curPage}
          immediately={getDataList}
          change={pageChange}
          total={total}
        />
      </Spin>

      <PersonApplyModal
        isShow={showModal}
        editId={editId}
        editData={editData}
        onCancel={showInfoModal}
        onOk={updatePropertyData}
      />

      {/* 添加弹窗 */}
      <Modal
        title="审核申请"
        visible={showCheckModal}
        cancelText="取消"
        okText="确认"
        onOk={() => addCheck()}
        onCancel={() => setCheckModal(false)}
      >
        <Form form={form}>
          <Form.Item
            label="审核申请"
            name="ifAduit"
            rules={[
              {
                required: true,
                message: "请选择审核结果",
              }
            ]}
          >
            <Select  placeholder="请做出审核">
              <Option value="1">通过</Option>
              <Option value="2">不通过</Option>
          </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
SearchPage.route = {
  path: "/person/apply",
};
