import {
  FlatList,
  Heading,
  HStack,
  IconButton,
  Text,
  useTheme,
  VStack,
  Center,
} from "native-base";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SignOut, ChatTeardropText } from "phosphor-react-native";
import { useState, useEffect } from "react";
import auth from "@react-native-firebase/auth";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";

import Logo from "../assets/logo_secondary.svg";
import { Filter } from "../components/Filter";
import { Button } from "../components/Button";
import { Loading } from "../components/Loading";
import { Order, OrderProps } from "../components/Order";
import { COLLECTION_ORDERS } from "../services/firebase/collections";
import { dateFormat } from "../utils/FirestoreDateFormat";

type StatusSelectedProps = "open" | "closed";

export function Home() {
  const { colors } = useTheme();
  const [statusSelected, setStatusSelected] = useState<"open" | "closed">(
    "open"
  );
  const [orders, setOrders] = useState<OrderProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();

  function handleNewOrder() {
    navigation.navigate("new");
  }

  function handleOpenDetails(orderId: string) {
    navigation.navigate("details", { orderId });
  }

  function handleLogout() {
    auth()
      .signOut()
      .then((response) => {})
      .catch((error) => {
        console.log(error);
        Alert.alert("Não foi possível efetuar o logout.");
      });
  }

  useEffect(() => {
    setIsLoading(true);

    const subscriber = firestore()
        .collection(COLLECTION_ORDERS)
        .where("status", "==", statusSelected)
        .onSnapshot((snapshot) => {
          const data = snapshot.docs.map((doc) => {
            const { patrimony, description, status, created_at } = doc.data();

            return {
              id: doc.id,
              patrimony,
              description,
              status,
              created_at: dateFormat(created_at),
            };
          });

          setOrders(data);
          setIsLoading(false);
        });

      return subscriber;

  }, [statusSelected]);

  return (
    <VStack flex={1} pb={6} bg="gray.700">
      <HStack
        w="full"
        justifyContent="space-between"
        alignItems="center"
        bg="gray.600"
        pt={12}
        pb={5}
        px={6}
      >
        <Logo />
        <IconButton
          icon={<SignOut size={26} color={colors.gray[300]} />}
          onPress={handleLogout}
        />
      </HStack>

      <VStack flex={1} px={6}>
        <HStack
          w="full"
          mt={8}
          mb={4}
          justifyContent="space-between"
          alignItems="center"
        >
          <Heading color="gray.100">Solicitações</Heading>
          <Text color="gray.200">{orders.length}</Text>
        </HStack>

        <HStack space={3} mb={8}>
          <Filter
            title="em andamento"
            type="open"
            onPress={() => setStatusSelected("open")}
            isActive={statusSelected === "open"}
          />
          <Filter
            title="finalizados"
            type="closed"
            onPress={() => setStatusSelected("closed")}
            isActive={statusSelected === "closed"}
          />
        </HStack>

        {isLoading ? (
          <Loading />
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Order data={item} onPress={() => handleOpenDetails(item.id)} />
            )}
            contentContainerStyle={{
              paddingBottom: 100,
            }}
            ListEmptyComponent={() => (
              <Center pt={6}>
                <ChatTeardropText color={colors.gray[300]} size={40} />

                <Text color="gray.300" fontSize="xl" mt={6} textAlign="center">
                  Você ainda não possui {"\n"}solicitações{" "}
                  {statusSelected === "open" ? "em andamento" : "finalizados"}
                </Text>
              </Center>
            )}
          />
        )}

        <Button title="Nova solicitação" onPress={handleNewOrder} />
      </VStack>
    </VStack>
  );
}
