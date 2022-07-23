import { VStack, Text, HStack, useTheme, ScrollView, Box } from "native-base";
import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import firestore from "@react-native-firebase/firestore";
import {
  CircleWavyCheck,
  Hourglass,
  DesktopTower,
  Clipboard,
} from "phosphor-react-native";

import { Header } from "../components/Header";
import { OrderProps } from "../components/Order";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Loading } from "../components/Loading";

import { COLLECTION_ORDERS } from "../services/firebase/collections";
import { OrderFirestoreDTO } from "../dtos/OrderFirestoreDTO";
import { dateFormat } from "../utils/FirestoreDateFormat";
import { CardDetails } from "../components/CardDetails";

type RouteParams = {
  orderId: string;
};

type OrderDetails = OrderProps & {
  solution?: string;
  closed_at?: string;
};

export function Details() {
  const [isLoading, setIsLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [order, setOrder] = useState<OrderDetails>({} as OrderDetails);
  const [solution, setSolution] = useState("");

  const { colors } = useTheme();

  const route = useRoute();
  const { orderId } = route.params as RouteParams;

  const navigation = useNavigation();

  function handleOrderClose() {
    if (solution === "") {
      return Alert.alert(
        "Solicitação",
        "Informe a solução para encerrar a solicitação."
      );
    }

    setIsClosing(true);

    firestore()
      .collection(COLLECTION_ORDERS)
      .doc(orderId)
      .update({
        status: "closed",
        solution,
        closed_at: firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        Alert.alert("Solicitação", "Solicitação encerrada.");
        navigation.goBack();
      })
      .catch((error) => {
        console.log(error);

        return Alert.alert(
          "Solicitação",
          "Não foi possível encerrar a solicitação."
        );
      });

    setIsClosing(false);
  }

  useEffect(() => {
    firestore()
      .collection<OrderFirestoreDTO>(COLLECTION_ORDERS)
      .doc(orderId)
      .get()
      .then((doc) => {
        const {
          patrimony,
          description,
          status,
          created_at,
          closed_at,
          solution,
        } = doc.data();

        const closed = closed_at ? dateFormat(closed_at) : null;

        const data = {
          id: doc.id,
          patrimony,
          description,
          status,
          created_at: dateFormat(created_at),
          closed_at: closed,
          solution,
        };
        setOrder(data);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <Loading />;

  return (
    <VStack flex={1} bg="gray.700">
      <Box px={6} bg="gray.600">
        <Header title="Solicitação" />
      </Box>

      <HStack bg="gray.500" justifyContent="center" p={4}>
        {order.status === "closed" ? (
          <CircleWavyCheck size={22} color={colors.green[300]} />
        ) : (
          <Hourglass size={22} color={colors.secondary[700]} />
        )}

        <Text
          fontSize="sm"
          color={
            order.status === "closed"
              ? colors.green[300]
              : colors.secondary[700]
          }
          ml={2}
          textTransform="uppercase"
        >
          {order.status === "closed" ? "Finalizado" : "Em andamento"}
        </Text>
      </HStack>

      <ScrollView mx={5} showsVerticalScrollIndicator={false}>
        <CardDetails
          title="Equipamento"
          description={`Patrimônio ${order.patrimony}`}
          icon={DesktopTower}          
        />

        <CardDetails
          title="Descrição do problema"
          description={order.description}
          icon={Clipboard}
		  footer={`Registrado em ${order.created_at}`}
        />

        <CardDetails
          title="Solução"
          icon={CircleWavyCheck}
          footer={order.closed_at ? `Encerrado em ${order.closed_at}` : null}
          description={order.solution}
          children={
            order.status === "open" && (
              <Input
                bg="gray.600"
                borderWidth={1}
                borderColor="gray.500"
                placeholder="Descrição da solução"
                onChangeText={setSolution}
                h={24}
                textAlignVertical="top"
                multiline
              />
            )
          }
        />
      </ScrollView>

      {order.status === "open" && (
        <Button
          title="Encerrar solicitação"
          m={5}
          onPress={handleOrderClose}
          isLoading={isClosing}
        />
      )}
    </VStack>
  );
}
