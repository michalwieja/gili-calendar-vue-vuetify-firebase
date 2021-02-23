<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">Gili zapisy</div>
    </v-app-bar>
    <v-main>
      <v-row class="fill-height">
        <v-dialog v-model="dialog" max-width="600px">
          <v-card>
            <form>
              <v-card-title>
                <span class="headline">Zapisz się</span>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-text-field label="Imię" required></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field label="Nazwisko" required></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-text-field label="Telefon" required></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-select
                        :items="['0-2', '2-4', '4-6']"
                        label="Wiek dziecka"
                        required
                      ></v-select>
                    </v-col>
                  </v-row>
                </v-container>
                <small>Wszystkie pola są wymagane</small>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  :color="selectedEvent.color"
                  text
                  @click="dialog = false"
                >
                  Anuluj
                </v-btn>
                <v-btn
                  type="submit"
                  :color="selectedEvent.color"
                  @click="submit"
                >
                  Potwierdź
                </v-btn>
              </v-card-actions>
            </form>
          </v-card>
        </v-dialog>
        <v-col>
          <v-sheet height="64">
            <v-toolbar flat>
              <v-btn
                outlined
                class="mr-4"
                color="grey darken-2"
                @click="setToday"
              >
                Dziś
              </v-btn>
              <v-btn fab text small color="grey darken-2" @click="prev">
                <v-icon small> mdi-chevron-left </v-icon>
              </v-btn>
              <v-btn fab text small color="grey darken-2" @click="next">
                <v-icon small> mdi-chevron-right </v-icon>
              </v-btn>
              <v-toolbar-title v-if="$refs.calendar">
                {{ $refs.calendar.title }}
              </v-toolbar-title>
              <v-spacer></v-spacer>
              <v-menu bottom right>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    outlined
                    color="grey darken-2"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <span>{{ typeToLabel[type] }}</span>
                    <v-icon right> mdi-menu-down </v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="type = 'day'">
                    <v-list-item-title>Dzień</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="type = 'week'">
                    <v-list-item-title>Tydzień</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="type = 'month'">
                    <v-list-item-title>Miesiąc</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="type = '4day'">
                    <v-list-item-title>4 dni</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-toolbar>
          </v-sheet>
          <v-sheet height="600">
            <v-calendar
              :first-interval="9"
              :interval-count="10"
              ref="calendar"
              v-model="focus"
              color="primary"
              :events="events"
              :event-color="getEventColor"
              :type="type"
              @click:event="showEvent"
              @click:more="viewDay"
              @click:date="viewDay"
            ></v-calendar>
            <v-menu
              v-model="selectedOpen"
              :close-on-content-click="false"
              :activator="selectedElement"
              offset-x
            >
              <v-card color="grey lighten-4" min-width="350px" flat>
                <v-toolbar :color="selectedEvent.color" dark>
                  <v-toolbar-title
                    v-html="selectedEvent.name"
                  ></v-toolbar-title>
                  <v-spacer></v-spacer>
                </v-toolbar>
                <v-card-text>
                  <div v-html="selectedEvent.details"></div>
                  <div>
                    Liczba miejsc:
                    <span v-html="selectedEvent.reserved"></span> /
                    <span v-html="selectedEvent.seats"></span>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-btn text color="secondary" @click="selectedOpen = false">
                    Anuluj
                  </v-btn>
                  <v-btn
                    :color="selectedEvent.color"
                    :disabled="
                      selectedEvent.reserved >= selectedEvent.seats
                        ? ''
                        : disabled
                    "
                    @click="openModal"
                  >
                    Zapisz
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-menu>
          </v-sheet>
        </v-col>
      </v-row>
    </v-main>
  </v-app>
</template>

<script>
import { db } from "@/main.js";

export default {
  name: "App",

  data: () => ({
    focus: "",
    type: "week",
    typeToLabel: {
      month: "Miesiąc",
      week: "Tydzień",
      day: "Dzień",
      "4day": "4 dni",
    },

    name: null,
    details: null,
    seats: 5,
    start: null,
    end: null,
    color: "#fof",
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    events: [],
    dialog: false,
    isDisabled: false,
  }),

  mounted() {
    this.getEvents();
  },

  methods: {
    async submit() {
      await db
        .collection("schedule")
        .doc(this.selectedEvent.id)
        .update({
          reserved: this.selectedEvent.reserved + 1,
        });
      this.getEvents();
    },

    async handleConfirmClick(e) {
      await db
        .collection("schedule")
        .doc(this.selectedEvent.id)
        .update({
          reserved: this.selectedEvent.reserved + 1,
        });

      this.getEvents();
      this.dialog = false;
    },

    openModal() {
      this.dialog = true;
      this.selectedOpen = false;
    },
    async getEvents() {
      let snapshot = await db.collection("schedule").get();
      let events = [];
      snapshot.forEach((doc) => {
        let eventData = doc.data();
        eventData.id = doc.id;
        events.push(eventData);
      });
      this.events = events;
    },
    getEventColor(ev) {
      return ev.color;
    },
    viewDay({ date }) {
      this.focus = date;
      this.type = "day";
    },
    setToday() {
      this.focus = "";
    },
    prev() {
      this.$refs.calendar.prev();
    },
    next() {
      this.$refs.calendar.next();
    },
    showEvent({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event;
        this.selectedElement = nativeEvent.target;
        setTimeout(() => {
          this.selectedOpen = true;
        }, 10);
      };

      if (this.selectedOpen) {
        this.selectedOpen = false;
        setTimeout(open, 10);
      } else {
        open();
      }

      nativeEvent.stopPropagation();
    },
  },
};
</script>
