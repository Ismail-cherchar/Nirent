/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Home from './pages/Home.js';
import Search from './pages/Search.js';
import AddItem from './pages/AddItem.js';
import ItemDetail from './pages/ItemDetail.js';
import Messages from './pages/Messages.js';
import Chat from './pages/Chat.js';
import Bookings from './pages/Bookings.js';
import Review from './pages/Review.js';
import Profile from './pages/Profile.js';
import EditProfile from './pages/EditProfile.js';
import AdminPanel from './pages/AdminPanel.js';
import MapView from './pages/MapView.js';
import Exchange from './pages/Exchange.js';
import Notifications from './pages/Notifications.js';
import OwnerProfile from './pages/OwnerProfile.js';
import Favorites from './pages/Favorites.js';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Search": Search,
    "AddItem": AddItem,
    "ItemDetail": ItemDetail,
    "Messages": Messages,
    "Chat": Chat,
    "Bookings": Bookings,
    "Review": Review,
    "Profile": Profile,
    "EditProfile": EditProfile,
    "AdminPanel": AdminPanel,
    "MapView": MapView,
    "Exchange": Exchange,
    "Notifications": Notifications,
    "OwnerProfile": OwnerProfile,
    "Favorites": Favorites,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};