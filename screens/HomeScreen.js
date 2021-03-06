import React from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert
} from "react-native";
import Modal from "react-native-modal";
import firebase from "firebase";
import "firebase/firestore";
import Announcement from "../components/home/Announcement";
import AnnouncementPopUp from "../components/home/AnnouncementPopUp";
import AnnouncementAdd from "../components/home/AnnouncementAdd";
import AddButton from "../components/AddButton";

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
    this.db = firebase.firestore().collection("announcements");
    this.state = {
      announcements: [],
      announcementsRendering: [],
      currentAnnouncement: null,
      popupVisible: false,
      addItemVisible: false,
      refreshCount: 1
    };

    //this.getAnnouncements = this.getAnnouncements.bind(this); // binding for setState. Use other binding method
  }

  componentDidMount() {
    this._getAnnouncements(); // retrieves all the announcements on loading
  }

  render() {
    return (
      <View style={styles.container}>
        {/* Modal for announcement pop up. Default visiblity is set to false  */}
        {/* When modal is visible, an array of single announcement is passed as props */}
        <Modal
          style={styles.popup}
          isVisible={this.state.popupVisible}
          onBackdropPress={this._toggleAnnouncementPopUp}
          onBackButtonPress={this._toggleAnnouncementPopUp}
        >
          <AnnouncementPopUp announcement={this.state.currentAnnouncement} />
        </Modal>

        {/* Modal for announcement add. Default visiblity is set to false */}

        <Modal
          style={styles.popup}
          isVisible={this.state.addItemVisible}
          onBackdropPress={this._toggleAnnouncementAdd}
          onBackButtonPress={this._toggleAnnouncementAdd}
        >
          <AnnouncementAdd
            onPressFunction={this._addAnnouncement}
            toggleFunction={this._toggleAnnouncementAdd}
            database={this.db}
          />
        </Modal>

        {/* Main content */}
        <View style={styles.iconHeader}>
          <Image
            source={require("../assets/images/announcement.png")}
            style={styles.icon}
          />
        </View>
        <Image
          source={require("../assets/images/overflow.png")}
          style={styles.overflowBanner}
        />
        <View style={styles.contentContainer}>
          {this._renderAnnouncements()}
        </View>
        <View style={styles.optionContainer}>
          <View style={styles.option}>
            <AddButton
              msg={"+"}
              onPressFunction={this._toggleAnnouncementAdd}
            />
          </View>
        </View>
      </View>
    );
  }

  // Announcement rendering method. Render a list of announcements stored in array.
  // If the array is empty (no available announcements), then blank view with alert is rendered
  _renderAnnouncements = () => {
    if (
      this.state.announcementsRendering &&
      this.state.announcementsRendering.length
    ) {
      return (
        <ScrollView style={styles.content}>
          {this.state.announcementsRendering}
        </ScrollView>
      );
    }
    return (
      <View style={styles.contentEmpty}>
        <Text style={{ fontSize: 16, color: "lightgrey" }}>
          NO ANNOUNCEMENTS
        </Text>
      </View>
    );
  };

  _getAnnouncements = () => {
    this.db.orderBy("date", "asc").onSnapshot(docs => {
      var counter = docs.size - 1;
      _announcements = [];
      _announcementsRendering = [];
      docs.forEach(doc => {
        var _title = doc.data().title;
        var _content = doc.data().content;
        var _date = doc.data().date;
        // add elements to temporary announcement array
        _announcements.unshift({
          title: _title,
          content: _content,
          date: _date
        });
        // add elements to temporary announcement rendering array
        _announcementsRendering.unshift(
          this._constructAnnouncement(counter--, _title, _content, _date)
        );
        this.setState({
          announcements: _announcements,
          announcementsRendering: _announcementsRendering
        });
      });
    });
  };

  // Creates a single Announcement touchable component for rendering
  _constructAnnouncement(id, _title, _content, _date) {
    return (
      <TouchableOpacity onPress={() => this._retrieveAnnouncement(id)} key={id}>
        <Announcement
          title={_title}
          content={_content}
          date={_date}
          announcementId={id}
        />
      </TouchableOpacity>
    );
  }

  // When user touches an announcement, sets corresponding announcement as prop for popup
  _retrieveAnnouncement = id => {
    this.setState({
      currentAnnouncement: this.state.announcements[id]
    });
    this._toggleAnnouncementPopUp();
  };

  // updates the announcement firestore with random generated document id
  //    update occurs on AnnouncementAdd component. Pass all the necessary props to the component
  _addAnnouncement(_title, _content, toggle, db, hashGenerator) {
    if (_title == "" || _content == "") {
      Alert.alert("Warning", "Title and content cannot be empty", [
        { text: "OK", onPress: () => console.log("No title and content") }
      ]);
    } else {
      db.doc(hashGenerator()).set({
        title: _title,
        content: _content,
        date: new Date()
      });
      toggle();
    }
  }

  // Modal visibility control functions
  _toggleAnnouncementPopUp = () =>
    this.setState({ popupVisible: !this.state.popupVisible });

  _toggleAnnouncementAdd = () =>
    this.setState({ addItemVisible: !this.state.addItemVisible });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,1.0)",
    flexDirection: "column",
    paddingTop: 24
  },
  icon: {
    width: 40,
    height: 40
  },
  iconHeader: {
    width: "100%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "seagreen"
  },
  overflowBanner: {
    width: "100%",
    height: 200,
    resizeMode: "cover"
  },
  contentContainer: {
    flex: 1,
    alignItems: "center"
  },
  content: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "lightgrey",
    width: "90%"
  },
  contentEmpty: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "lightgrey",
    width: "90%",
    justifyContent: "center",
    alignItems: "center"
  },
  popup: {
    justifyContent: "center",
    alignItems: "center"
  },
  option: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  optionContainer: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: "center"
  }
});
